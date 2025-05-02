// src/app/api/clerk/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/user.model";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET!,
    });
  } catch (err) {
    console.error("🔒 Clerk webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  await connectToDB();
  const { type, data } = evt;
  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e: any) => e.id === data.primary_email_address_id
    )?.email_address || "";

    try {
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          // Only insert clerkId on the first upsert
          $setOnInsert: { clerkId: data.id },
          // Always update these fields
          $set: {
            email:     primaryEmail,
            firstName: data.first_name  || "",
            lastName:  data.last_name   || "",
            username:  data.username    || "",
            imageUrl:  data.image_url   || "",
          },
        },
        {
          upsert: true,
          new:    true,
        }
      );
    } catch (err: any) {
      // If there *is* still a duplicate error, log but don’t crash
      if (err.code === 11000) {
        console.warn("⚠️ Duplicate key conflict on upsert:", err.keyValue);
      } else {
        throw err;
      }
    }
  }

  return NextResponse.json({}, { status: 200 });
}

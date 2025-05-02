// src/app/api/spaces/[spaceId]/documents/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import { Space } from "@/models/spaces.model";
import User from "@/models/user.model";
import { DocumentModel as Document } from "@/models/documents.model";
import { Types } from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, props: { params: Promise<{ spaceId: string }> }) {
  const params = await props.params;
  const { spaceId } = params;
  console.log("[docs] 🔔 GET documents for space:", spaceId);

  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const user = await User.findOne({ clerkId });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const space = await Space.findOne({ _id: spaceId, owner: user._id });
  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  const docs = await Document.find({ space: space._id }).sort({ createdAt: -1 });
  return NextResponse.json(docs, { status: 200 });
}

export async function POST(req: NextRequest, props: { params: Promise<{ spaceId: string }> }) {
  const params = await props.params;
  const { spaceId } = params;
  console.log("[docs] 🔔 POST new document to space:", spaceId);

  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // parse the incoming form-data
  const form = await req.formData();
  const fileField = form.get("file");
  const titleField = form.get("title") as string | null;

  if (!fileField || !(fileField instanceof Blob)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // pull name/size off the blob safely
  const fileName =
    typeof (fileField as any).name === "string"
      ? (fileField as any).name
      : "Untitled";
  const fileSize =
    typeof (fileField as any).size === "number"
      ? (fileField as any).size
      : 0;

  await connectToDB();
  const user = await User.findOne({ clerkId });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const space = await Space.findOne({ _id: spaceId, owner: user._id });
  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  // proxy to your upload route, forwarding cookies so Clerk can auth you there
  const origin = new URL(req.url).origin;
  const uploadForm = new FormData();
  uploadForm.append("file", fileField);

  const cookie = req.headers.get("cookie") ?? "";
  const uploadRes = await fetch(`${origin}/api/cloudinary/upload`, {
    method: "POST",
    body: uploadForm,
    headers: {
      // forward the user’s cookies:
      cookie,
    },
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    console.error("[docs] Cloud upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }

  const { publicId, secureUrl, format, width, height } = await uploadRes.json();

  // now persist the record
  const doc = await Document.create({
    space: space._id,
    title: (titleField?.trim() || fileName),
    fileType: format,
    fileSize,
    publicId,
    secureUrl,
    createdBy: user._id,
  });

  space.documents.push(doc._id as unknown as Types.ObjectId);
  await space.save();

  console.log("[docs] 🎉 Created document:", doc._id);
  return NextResponse.json(doc, { status: 201 });
}

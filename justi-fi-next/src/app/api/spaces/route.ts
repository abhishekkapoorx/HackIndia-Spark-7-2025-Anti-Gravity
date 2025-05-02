// src/app/api/spaces/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import { Space } from "@/models/spaces.model";
import User from "@/models/user.model";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  console.log("[spaces] 🔔 GET received at", new Date().toISOString());
  console.log("[spaces] Request URL:", req.url);

  // 1) Authenticate
  const { userId: clerkId } = getAuth(req);
  console.log("[spaces] Clerk getAuth returned clerkId:", clerkId, "(", typeof clerkId, ")");

  if (!clerkId) {
    console.warn("[spaces] 🚫 Unauthorized: no clerkId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Connect to MongoDB
  console.log("[spaces] ⏳ Connecting to MongoDB...");
  await connectToDB();
  console.log("[spaces] ✅ MongoDB connected");

  // 3) Find MongoDB user corresponding to Clerk user
  try {
    // Find the MongoDB user document that matches the Clerk ID
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      console.warn("[spaces] ⚠️ User not found in MongoDB with clerkId:", clerkId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("[spaces] 👤 Found MongoDB user:", user._id);

    // 4) Fetch spaces using MongoDB user ID
    console.log("[spaces] 🔍 Querying spaces for owner =", user._id);
    const spaces = await Space.find({ owner: user._id }).sort({ createdAt: -1 });
    console.log("[spaces] 🎉 Fetched spaces:", spaces);
    return NextResponse.json(spaces, { status: 200 });
  } catch (err: any) {
    console.error("[spaces] ❌ GET error:", err.message, err);
    return NextResponse.json({ error: "Failed to fetch spaces" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("[spaces] 🔔 POST received at", new Date().toISOString());
  console.log("[spaces] Request URL:", req.url);

  // 1) Authenticate
  const { userId: clerkId } = getAuth(req);
  console.log("[spaces] Clerk getAuth returned clerkId:", clerkId, "(", typeof clerkId, ")");
  
  if (!clerkId) {
    console.warn("[spaces] 🚫 Unauthorized: no clerkId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Parse JSON
  let body: { spaceName?: string } = {};
  try {
    body = await req.json();
    console.log("[spaces] Parsed JSON body:", body);
  } catch (e: any) {
    console.warn("[spaces] ⚠️ Invalid JSON body:", e.message);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { spaceName } = body;
  console.log("[spaces] spaceName:", spaceName);
  if (!spaceName || !spaceName.trim()) {
    console.warn("[spaces] 🚫 Missing spaceName");
    return NextResponse.json({ error: "spaceName is required" }, { status: 400 });
  }

  // 3) Connect to MongoDB
  console.log("[spaces] ⏳ Connecting to MongoDB...");
  await connectToDB();
  console.log("[spaces] ✅ MongoDB connected");

  // 4) Find MongoDB user corresponding to Clerk user
  try {
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      console.warn("[spaces] ⚠️ User not found in MongoDB with clerkId:", clerkId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("[spaces] 👤 Found MongoDB user:", user._id);

    // 5) Create the new space with MongoDB userId
    console.log("[spaces] Creating space with name:", spaceName.trim(), "and owner:", user._id);
    const newSpace = await Space.create({
      spaceName: spaceName.trim(),
      owner:     user._id,  
      threads:   [],
      documents: [],
    });
    console.log("[spaces] 🎉 Created newSpace:", newSpace);
    return NextResponse.json(newSpace, { status: 201 });
  } catch (err: any) {
    console.error("[spaces] ❌ POST error:", err.message, err);
    return NextResponse.json({ error: "Failed to create space" }, { status: 500 });
  }
}
// src/app/api/spaces/[spaceId]/threads/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import Thread from "@/models/threads.model";
import { Space } from "@/models/spaces.model";
import User from "@/models/user.model";
import { Types } from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, props: { params: Promise<{ spaceId: string }> }) {
  const params = await props.params;
  const { spaceId } = params;
  console.log("[threads] 🔔 GET threads for space:", spaceId);

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

  const threads = await Thread.find({ space: space._id }).sort({ createdAt: -1 });
  return NextResponse.json(threads, { status: 200 });
}

export async function POST(req: NextRequest, props: { params: Promise<{ spaceId: string }> }) {
  const params = await props.params;
  const { spaceId } = params;
  console.log("[threads] 🔔 POST new thread in space:", spaceId);

  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
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

  const thread = await Thread.create({
    space: space._id,
    title: title.trim(),
    createdBy: user._id,
    messages: [],
  });

  space.threads.push(thread._id as unknown as Types.ObjectId);
  await space.save();

  return NextResponse.json(thread, { status: 201 });
}

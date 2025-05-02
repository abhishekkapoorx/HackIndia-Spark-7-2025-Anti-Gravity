// src/app/api/spaces/[spaceId]/threads/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import Thread from "@/models/threads.model";
import { Space } from "@/models/spaces.model";
import User from "@/models/user.model";
import { Types } from "mongoose";
import Message from "@/models/message.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, props: { params: Promise<{ spaceId: string, user_id: string }> }) {
    const params = await props.params;
    const { spaceId, user_id } = params;
    console.log("[threads] 🔔 GET messages for space:", spaceId);

    // const { userId: clerkId } = getAuth(req);
    // if (!clerkId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await connectToDB();

    const user = await User.findOne({ _id: user_id });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const space = await Space.findOne({ _id: spaceId, owner: user._id });
    if (!space) {
        return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    const messages = await Message.find({ space: space._id, role: "user" }).sort({ createdAt: -1 });
    return NextResponse.json(messages, { status: 200 });
}

export async function POST(req: NextRequest, props: { params: Promise<{ spaceId: string }> }) {
    const params = await props.params;
    const { spaceId } = params;
    console.log("[threads] 🔔 POST new thread in space:", spaceId);

    const body = await req.json();
    const { user_id } = body;
    if (!user_id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ _id: user_id });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const space = await Space.findOne({ _id: spaceId, owner: user._id });
    if (!space) {
        return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    const messages = await Message.find({ space: space._id, role: "user" }).sort({ createdAt: -1 });
    return NextResponse.json(messages, { status: 200 });

    // return NextResponse.json(thread, { status: 201 });
}

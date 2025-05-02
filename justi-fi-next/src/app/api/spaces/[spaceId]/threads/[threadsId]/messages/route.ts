// src/app/api/spaces/[spaceId]/threads/[threadId]/messages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import Thread from "@/models/threads.model";
import { Space } from "@/models/spaces.model";
import User from "@/models/user.model";
import Message from "@/models/message.model";
import Insight from "@/models/insights.model";
import axios from "axios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { spaceId: string; threadsId: string } }
) {
  try {
    // Await the params and add additional checks
    const resolvedParams = await params;
    console.log("=============================================================");
    console.log("[messages] 🔔 GET messages for thread:", resolvedParams.threadsId, "in space:", resolvedParams.spaceId);
    console.log("=============================================================");
    const spaceId = resolvedParams.spaceId;
    const threadId = resolvedParams.threadsId;
    
    // Add extra validation to avoid MongoDB ObjectId errors
    if (!spaceId || spaceId === 'undefined') {
      console.error("[messages] ❌ Invalid spaceId:", spaceId);
      return NextResponse.json({ error: "Invalid space ID" }, { status: 400 });
    }
    
    if (!threadId || threadId === 'undefined') {
      console.error("[messages] ❌ Invalid threadId:", threadId);
      return NextResponse.json({ error: "Invalid thread ID" }, { status: 400 });
    }
    
    console.log("[messages] 🔔 GET messages for thread:", threadId, "in space:", spaceId);

    // 1) Auth check
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      console.warn("[messages] 🚫 Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Connect
    await connectToDB();

    // 3) Verify user exists
    const user = await User.findOne({ clerkId });
    if (!user) {
      console.warn("[messages] ⚠️ User not found for clerkId:", clerkId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4) Verify space ownership - with additional logging for debugging
    console.log("[messages] 🔍 Looking for space with _id:", spaceId, "and owner:", user._id);
    const space = await Space.findOne({ _id: spaceId, owner: user._id });
    if (!space) {
      console.warn("[messages] ⚠️ Space not found or not owned by user:", spaceId);
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // 5) Verify thread belongs to space
    const thread = await Thread.findOne({ _id: threadId, space: space._id });
    if (!thread) {
      console.warn("[messages] ⚠️ Thread not found in space:", threadId);
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // 6) Fetch messages from the separate collection
    const messages = await Message.find({ thread: thread._id })
      .sort({ createdAt: 1 })
      .lean();
    
    console.log("[messages] 🎉 Successfully fetched", messages.length, "messages");
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("[messages] ❌ Error in GET messages:", error);
    return NextResponse.json({ 
      error: "Failed to fetch messages", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { spaceId: string; threadsId: string } }
) {
  try {
    // Await the params and add additional checks
    const resolvedParams = await params;
    const spaceId = resolvedParams.spaceId;
    const threadId = resolvedParams.threadsId;
    
    // Add extra validation to avoid MongoDB ObjectId errors
    if (!spaceId || spaceId === 'undefined') {
      console.error("[messages] ❌ Invalid spaceId:", spaceId);
      return NextResponse.json({ error: "Invalid space ID" }, { status: 400 });
    }
    
    if (!threadId || threadId === 'undefined') {
      console.error("[messages] ❌ Invalid threadId:", threadId);
      return NextResponse.json({ error: "Invalid thread ID" }, { status: 400 });
    }
    
    console.log("[messages] 🔔 POST new message to thread:", threadId, "in space:", spaceId);

    // 1) Auth check
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      console.warn("[messages] 🚫 Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse request body
    const body = await req.json();
    const content = body.content;
    const role = body.role || "user";
    
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }
    if (!["user", "agent"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // 3) Connect
    await connectToDB();

    // 4) Verify user
    const user = await User.findOne({ clerkId });
    if (!user) {
      console.warn("[messages] ⚠️ User not found for clerkId:", clerkId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 5) Verify space - with additional logging for debugging
    console.log("[messages] 🔍 Looking for space with _id:", spaceId, "and owner:", user._id);
    const space = await Space.findOne({ _id: spaceId, owner: user._id });
    if (!space) {
      console.warn("[messages] ⚠️ Space not found or not owned by user:", spaceId);
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // 6) Verify thread
    const thread = await Thread.findOne({ _id: threadId, space: space._id });
    if (!thread) {
      console.warn("[messages] ⚠️ Thread not found in space:", threadId);
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // 7) Create the message in its own collection
    const newMessage = await Message.create({
      thread:  thread._id,
      space:   space._id,
      sender:  user._id,
      role,
      content: content.trim(),
    });

    // talk with llm 
    // Make API call to insights endpoint to get agent response
    let agentResponse = null;
    let insightsUpdated = false;
    
    if (role === "user") {
      try {
        // Call the insights route to get the AI response
        // const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const apiUrl = "http://127.0.0.1:8000/chat";
        
        // Create insights endpoint URL - handle both absolute and relative URLs
        let insightsUrl;
        // if (apiUrl) {
        //   // If API URL is provided, use it as a base
        //   insightsUrl = `${apiUrl}/api/spaces/${spaceId}/insights`;
        // } else {
        //   // If no API URL, use same-origin relative URL (handles server-side API calls)
        //   insightsUrl = `/api/spaces/${spaceId}/insights`;
        // }
        
        console.log("[messages] 📡 Calling insights API at:", insightsUrl);
        
        // For server-to-server requests in same app, create a proper URL with origin
        // Use the request object's headers to determine the host
        // const host = req.headers.get('host') || 'localhost:3000';
        // const protocol = host.includes('localhost') ? 'http' : 'https';
        // const absoluteUrl = `${protocol}://${host}${insightsUrl}`;
        
        // console.log("[messages] 📡 Absolute URL:", absoluteUrl);
        // const insightResponse = await axios.get(absoluteUrl);
        const insightResponse = await axios.post(apiUrl, {
          input: content.trim(),
          user_id: user._id,
          space_id: space._id,
          thread_id: thread._id,
          message: content.trim(),
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (insightResponse.data) {
          console.log("[messages] 📡 Received response from insights API:", insightResponse.data);

          
          // Check if response contains summary, positives, and negatives for insights update
          const { summary, positives, negatives } = insightResponse.data;

          // TODO: check if all need to be present
          // TODO: check if need to replace with new or interted with existing ones


          if (summary || positives || negatives) {
            try {
              console.log("[messages] 📊 Updating insights model with new data");
              
              // Check if an insight already exists for this thread
              const existingInsight = await Insight.findOne({ 
                space: space._id,
                thread: thread._id
              });
              
              if (existingInsight) {
                // Update existing insight
                await Insight.findByIdAndUpdate(existingInsight._id, {
                  summary,
                  positives,
                  negatives
                });
                console.log("[messages] 📊 Updated existing insight:", existingInsight._id);
              } else {
                // Create new insight
                const newInsight = await Insight.create({
                  space: space._id,
                  thread: thread._id,
                  createdBy: user._id,
                  summary,
                  positives,
                  negatives,
                  citations: insightResponse.data.citations || []
                });
                console.log("[messages] 📊 Created new insight:", newInsight._id);
              }
              
              // Set flag for frontend notification
              insightsUpdated = true;
            } catch (insightError) {
              console.error("[messages] ❌ Error updating insights model:", insightError);
              // Don't fail the whole request if insights update fails
            }
          }
          
          agentResponse = await Message.create({
            thread: thread._id,
            space: space._id,
            sender: user._id,
            role: "agent",
            content: insightResponse.data.result || "I'm sorry, I couldn't generate a response at this time.",
          });
        }
      } catch (error) {
        console.error("[messages] ⚠️ Error fetching agent response:", error);
        // Create a fallback agent response in case of error
        agentResponse = await Message.create({
          thread: thread._id,
          space: space._id,
          sender: user._id,
          role: "agent",
          content: "I'm sorry, I encountered an error while processing your request.",
        });
      }
    }

    console.log("[messages] 🎉 Created message:", newMessage._id);
    return NextResponse.json({ 
      userMessage: newMessage, 
      agentResponse,
      insightsUpdated
    }, { status: 201 });
  } catch (error) {
    console.error("[messages] ❌ Error in POST message:", error);
    return NextResponse.json({ 
      error: "Failed to create message", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
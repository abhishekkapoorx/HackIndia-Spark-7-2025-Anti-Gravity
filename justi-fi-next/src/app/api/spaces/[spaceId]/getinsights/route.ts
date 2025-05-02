import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import { Space } from "@/models/spaces.model";
import User from "@/models/user.model";
import Insight from "@/models/insights.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }>}
) {
  try {
    // Access spaceId directly from params object
    const { spaceId } = await params;
    
    console.log("[getinsights] 🔍 Fetching all insights for space:", spaceId);
    
    // Validate spaceId
    if (!spaceId || spaceId === "undefined") {
      console.error("[getinsights] ❌ Invalid spaceId:", spaceId);
      return NextResponse.json({ error: "Invalid space ID" }, { status: 400 });
    }
    
    // 1) Auth check
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      console.warn("[getinsights] 🚫 Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 2) Connect to database
    await connectToDB();
    
    // 3) Verify user exists
    const user = await User.findOne({ clerkId });
    if (!user) {
      console.warn("[getinsights] ⚠️ User not found for clerkId:", clerkId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // 4) Verify space ownership
    const space = await Space.findOne({ _id: spaceId, owner: user._id });
    if (!space) {
      console.warn("[getinsights] ⚠️ Space not found or not owned by user:", spaceId);
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }
    
    // 5) Fetch all insights for this space
    const insights = await Insight.find({ space: space._id }).lean();
    console.log("[getinsights] 🎉 Found", insights.length, "insights");
    
    // 6) Return insights data
    return NextResponse.json({
      insights,
      count: insights.length
    }, { status: 200 });
    
  } catch (error) {
    console.error("[getinsights] ❌ Error fetching insights:", error);
    return NextResponse.json({ 
      error: "Failed to fetch insights", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
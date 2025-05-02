import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import cloudinary from "@/lib/cloudinary";
import { getAuth } from "@clerk/nextjs/server";

export const runtime = "nodejs";


export const config = {
  api: {
    bodyParser: false,
    responseLimit: '5mb',
  },
};

export async function POST(request: NextRequest) {
  try {
   
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await request.formData();
    const fileField = formData.get("file");
    
    if (!fileField || !(fileField instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the Blob into a Buffer
    const arrayBuffer = await fileField.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Stream that buffer into Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "justifi_docs",
          resource_type: "auto" // Auto-detect resource type (image, pdf, etc.)
        },
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
      
      // Pipe our Buffer into the upload stream
      Readable.from(buffer).pipe(uploadStream);
    });

    // Return the Cloudinary data back to the client
    return NextResponse.json(
      {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
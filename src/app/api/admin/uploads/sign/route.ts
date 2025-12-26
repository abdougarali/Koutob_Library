import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { cloudinaryConfig } from "@/lib/cloudinary";

function requireEnv() {
  const { cloudName, apiKey } = cloudinaryConfig;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  }
  return { cloudName, apiKey, apiSecret };
}

// POST: Return a signed payload for direct upload to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cloudName, apiKey, apiSecret } = requireEnv();

    // Optional folder override from client; defaults to configured folder
    const body = await request.json().catch(() => ({}));
    const folder = (body.folder as string) || cloudinaryConfig.uploadFolder || "bookshop/books";
    const timestamp = Math.floor(Date.now() / 1000);
    const eager = "c_fill,f_auto,q_auto:good,w_800"; // example eager transformation

    // Build signature string according to Cloudinary rules
    // Only include signed parameters in alphabetical order
    const paramsToSign: Record<string, string | number> = {
      eager,
      folder,
      timestamp,
    };

    const signatureBase = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&") + apiSecret;

    const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      eager,
    });
  } catch (error: any) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json({ error: "Failed to create upload signature" }, { status: 500 });
  }
}






















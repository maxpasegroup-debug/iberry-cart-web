import { NextRequest } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getCloudinary } from "@/lib/cloudinary";
import { logCriticalAction } from "@/lib/monitoring";
import { z } from "zod";
import type { UploadApiResponse } from "cloudinary";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    const cloudinary = getCloudinary();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return errorResponse("Missing file", 400);
    }

    if (!file.type.startsWith("image/")) {
      return errorResponse("Invalid file type", 400);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return errorResponse("File too large (max 5MB)", 400);
    }

    const folderRaw = formData.get("folder")?.toString() ?? "iberrycart/products";
    const folderParsed = z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-zA-Z0-9/_-]+$/, "Invalid folder characters")
      .safeParse(folderRaw.trim());
    if (!folderParsed.success) {
      return errorResponse("Invalid folder", 400, folderParsed.error.flatten());
    }
    const folder = folderParsed.data;

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    const secureUrl = uploadResult?.secure_url;
    if (!secureUrl) {
      return errorResponse("Upload failed (no secure_url returned)", 500);
    }

    logCriticalAction("image_uploaded", {
      adminId: String(admin.userId),
      folder,
      secureUrl,
    });

    return successResponse({ secure_url: secureUrl }, "Image uploaded");
  } catch (error) {
    logCriticalAction("image_upload_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
    return errorResponse("Image upload failed", 500, String(error));
  }
}


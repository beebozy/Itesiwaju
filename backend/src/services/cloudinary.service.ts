import { v2 as cloudinary } from "cloudinary";

import { env } from "../config/env.js";

if (
  !env.CLOUDINARY_CLOUD_NAME ||
  !env.CLOUDINARY_API_KEY ||
  !env.CLOUDINARY_API_SECRET
) {
  throw new Error("Cloudinary environment variables are not configured.");
}

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export function uploadImage(
  buffer: Buffer,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "itesiwaju/reports",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("CLOUDINARY_UPLOAD_FAILED"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
}
import cloudinary from "../lib/cloudinary.js";
import { AppError } from "../lib/error.js";

const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

export function uploadImage(buffer: Buffer, folder: string): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                allowed_formats: ALLOWED_IMAGE_FORMATS,
            },
            (error, result) => {
                if (error) {
                    if (typeof error.http_code === "number" && error.http_code >= 400 && error.http_code < 500) {
                        reject(new AppError("Only valid JPEG, PNG, and WebP image files are allowed", 400));
                        return;
                    }
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary upload failed"));
                    return;
                }

                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );

        uploadStream.end(buffer);
    });
}

export async function deleteImage(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
}
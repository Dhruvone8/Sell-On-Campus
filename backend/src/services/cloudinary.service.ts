import cloudinary from "../lib/cloudinary.js";

export function uploadImage(buffer: Buffer, folder: string): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder },
            (error, result) => {
                if (error) {
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
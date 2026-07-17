import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

/**
 * Multer memory storage gives us a Buffer, not a file path, so we stream
 * it directly to Cloudinary instead of writing to disk first.
 */
export const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Uploads an array of multer file objects (req.files) in parallel.
 * Returns an array of { url, publicId }.
 */
export const uploadMultipleToCloudinary = async (files = [], folder) => {
  if (!files.length) return [];
  const uploads = files.map((file) =>
    uploadBufferToCloudinary(file.buffer, folder)
  );
  return Promise.all(uploads);
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

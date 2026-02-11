// Supabase Storage utility functions for image uploads and deletions

import { supabaseAdmin } from "./supabase";

const STORAGE_BUCKET = "yatrivo-storage";

/**
 * Upload a single image to Supabase Storage
 * @param file - The file buffer to upload
 * @param path - Storage path (e.g., "trip-categories/categoryId/image.jpg")
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(file: Buffer | Blob, path: string): Promise<string> {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .upload(path, file, {
                contentType: "image/jpeg",
                upsert: false,
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Failed to upload image");
    }
}

/**
 * Upload multiple images to Supabase Storage
 * @param files - Array of file buffers to upload
 * @param basePath - Base storage path (e.g., "tour-packages/packageId")
 * @returns Array of public URLs
 */
export async function uploadMultipleImages(
    files: (Buffer | Blob)[],
    basePath: string
): Promise<string[]> {
    try {
        const uploadPromises = files.map((file, index) => {
            const fileName = `image-${Date.now()}-${index}.jpg`;
            const path = `${basePath}/${fileName}`;
            return uploadImage(file, path);
        });

        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error("Error uploading multiple images:", error);
        throw new Error("Failed to upload images");
    }
}

/**
 * Delete an image from Supabase Storage by path
 * @param url - The full public URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
    try {
        // Extract the storage path from the URL
        const urlParts = url.split(`${STORAGE_BUCKET}/`);
        if (urlParts.length < 2) {
            throw new Error("Invalid storage URL");
        }

        const path = urlParts[1];

        const { error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .remove([path]);

        if (error && error.message !== "Object not found") {
            throw error;
        }
    } catch (error: any) {
        // If file doesn't exist, don't throw error
        if (error.message?.includes("not found")) {
            console.warn("Image not found in storage:", url);
            return;
        }
        console.error("Error deleting image:", error);
        throw new Error("Failed to delete image");
    }
}

/**
 * Delete multiple images from Supabase Storage
 * @param urls - Array of public URLs to delete
 */
export async function deleteMultipleImages(urls: string[]): Promise<void> {
    try {
        const deletePromises = urls.map((url) => deleteImage(url));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error deleting multiple images:", error);
        throw new Error("Failed to delete images");
    }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Validate image file type
 */
export function isValidImageType(filename: string): boolean {
    const validTypes = ["jpg", "jpeg", "png", "webp"];
    const ext = getFileExtension(filename);
    return validTypes.includes(ext);
}

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
    const ext = getFileExtension(originalFilename);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}.${ext}`;
}

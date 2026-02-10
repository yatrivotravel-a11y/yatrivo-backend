// Firebase Storage utility functions for image uploads and deletions

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a single image to Firebase Storage
 * @param file - The file to upload
 * @param path - Storage path (e.g., "trip-categories/categoryId/image.jpg")
 * @returns Download URL of the uploaded image
 */
export async function uploadImage(file: Buffer | Blob, path: string): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Failed to upload image");
    }
}

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of files to upload
 * @param basePath - Base storage path (e.g., "tour-packages/packageId")
 * @returns Array of download URLs
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
 * Delete an image from Firebase Storage by URL
 * @param url - The full download URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
    try {
        // Extract the storage path from the URL
        const decodedUrl = decodeURIComponent(url);
        const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);

        if (!pathMatch || !pathMatch[1]) {
            throw new Error("Invalid storage URL");
        }

        const path = pathMatch[1];
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error: any) {
        // If file doesn't exist, don't throw error
        if (error.code === "storage/object-not-found") {
            console.warn("Image not found in storage:", url);
            return;
        }
        console.error("Error deleting image:", error);
        throw new Error("Failed to delete image");
    }
}

/**
 * Delete multiple images from Firebase Storage
 * @param urls - Array of download URLs to delete
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

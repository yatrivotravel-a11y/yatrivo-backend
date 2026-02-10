import { NextRequest, NextResponse } from "next/server";
import {
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    uploadImage,
    deleteImage,
    generateUniqueFilename,
    isValidImageType,
} from "@/lib/storage";
import type { AdminApiResponse, TripCategory } from "@/types/admin";

// GET /api/admin/trip-categories/[id] - Get single trip category
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const categoryDoc = await getDoc(doc(db, "tripCategories", id));

        if (!categoryDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trip category not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const data = categoryDoc.data();
        const category: TripCategory = {
            id: categoryDoc.id,
            name: data.name,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return NextResponse.json(
            {
                success: true,
                data: category,
            } as AdminApiResponse<TripCategory>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get trip category error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch trip category",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// PUT /api/admin/trip-categories/[id] - Update trip category
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const formData = await request.formData();
        const name = formData.get("name") as string | null;
        const imageFile = formData.get("image") as File | null;

        // Check if category exists
        const categoryDoc = await getDoc(doc(db, "tripCategories", id));
        if (!categoryDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trip category not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const updateData: any = {
            updatedAt: serverTimestamp(),
        };

        // Update name if provided
        if (name) {
            if (name.trim().length < 2 || name.trim().length > 50) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Category name must be between 2 and 50 characters",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }
            updateData.name = name.trim();
        }

        // Update image if provided
        if (imageFile && imageFile.size > 0) {
            // Validate image file
            if (!isValidImageType(imageFile.name)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid image type. Only JPG, PNG, and WEBP are allowed",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }

            if (imageFile.size > 5 * 1024 * 1024) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Image size must be less than 5MB",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }

            // Delete old image
            const oldImageUrl = categoryDoc.data().imageUrl;
            if (oldImageUrl) {
                try {
                    await deleteImage(oldImageUrl);
                } catch (error) {
                    console.warn("Failed to delete old image:", error);
                }
            }

            // Upload new image
            const imageBuffer = await imageFile.arrayBuffer();
            const fileName = generateUniqueFilename(imageFile.name);
            const storagePath = `trip-categories/${id}/${fileName}`;
            const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);
            updateData.imageUrl = imageUrl;
        }

        // Update document
        await updateDoc(doc(db, "tripCategories", id), updateData);

        // Fetch updated document
        const updatedDoc = await getDoc(doc(db, "tripCategories", id));
        const data = updatedDoc.data()!;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: updatedDoc.id,
                    name: data.name,
                    imageUrl: data.imageUrl,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as TripCategory,
                message: "Trip category updated successfully",
            } as AdminApiResponse<TripCategory>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Update trip category error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to update trip category",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// DELETE /api/admin/trip-categories/[id] - Delete trip category
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const categoryDoc = await getDoc(doc(db, "tripCategories", id));

        if (!categoryDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trip category not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        // Delete image from storage
        const imageUrl = categoryDoc.data().imageUrl;
        if (imageUrl) {
            try {
                await deleteImage(imageUrl);
            } catch (error) {
                console.warn("Failed to delete image:", error);
            }
        }

        // Delete document
        await deleteDoc(doc(db, "tripCategories", id));

        return NextResponse.json(
            {
                success: true,
                message: "Trip category deleted successfully",
            } as AdminApiResponse,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Delete trip category error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to delete trip category",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

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
import type { AdminApiResponse, Destination } from "@/types/admin";

// GET /api/admin/destinations/[id] - Get single destination
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const destinationDoc = await getDoc(doc(db, "destinations", id));

        if (!destinationDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Destination not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const data = destinationDoc.data();
        const destination: Destination = {
            id: destinationDoc.id,
            placeName: data.placeName,
            city: data.city,
            tripCategoryId: data.tripCategoryId,
            tripCategoryName: data.tripCategoryName,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return NextResponse.json(
            {
                success: true,
                data: destination,
            } as AdminApiResponse<Destination>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get destination error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch destination",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// PUT /api/admin/destinations/[id] - Update destination
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const formData = await request.formData();
        const placeName = formData.get("placeName") as string | null;
        const city = formData.get("city") as string | null;
        const tripCategoryId = formData.get("tripCategoryId") as string | null;
        const imageFile = formData.get("image") as File | null;

        // Check if destination exists
        const destinationDoc = await getDoc(doc(db, "destinations", id));
        if (!destinationDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Destination not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const updateData: any = {
            updatedAt: serverTimestamp(),
        };

        // Update place name if provided
        if (placeName) {
            if (placeName.trim().length < 2 || placeName.trim().length > 100) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Place name must be between 2 and 100 characters",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }
            updateData.placeName = placeName.trim();
        }

        // Update city if provided
        if (city) {
            if (city.trim().length < 2 || city.trim().length > 50) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "City name must be between 2 and 50 characters",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }
            updateData.city = city.trim();
        }

        // Update trip category if provided
        if (tripCategoryId) {
            const categoryDoc = await getDoc(doc(db, "tripCategories", tripCategoryId));
            if (!categoryDoc.exists()) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid trip category ID",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }
            updateData.tripCategoryId = tripCategoryId;
            updateData.tripCategoryName = categoryDoc.data().name;
        }

        // Update image if provided
        if (imageFile && imageFile.size > 0) {
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
            const oldImageUrl = destinationDoc.data().imageUrl;
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
            const storagePath = `destinations/${id}/${fileName}`;
            const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);
            updateData.imageUrl = imageUrl;
        }

        // Update document
        await updateDoc(doc(db, "destinations", id), updateData);

        // Fetch updated document
        const updatedDoc = await getDoc(doc(db, "destinations", id));
        const data = updatedDoc.data()!;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: updatedDoc.id,
                    placeName: data.placeName,
                    city: data.city,
                    tripCategoryId: data.tripCategoryId,
                    tripCategoryName: data.tripCategoryName,
                    imageUrl: data.imageUrl,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Destination,
                message: "Destination updated successfully",
            } as AdminApiResponse<Destination>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Update destination error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to update destination",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// DELETE /api/admin/destinations/[id] - Delete destination
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const destinationDoc = await getDoc(doc(db, "destinations", id));

        if (!destinationDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Destination not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        // Delete image from storage
        const imageUrl = destinationDoc.data().imageUrl;
        if (imageUrl) {
            try {
                await deleteImage(imageUrl);
            } catch (error) {
                console.warn("Failed to delete image:", error);
            }
        }

        // Delete document
        await deleteDoc(doc(db, "destinations", id));

        return NextResponse.json(
            {
                success: true,
                message: "Destination deleted successfully",
            } as AdminApiResponse,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Delete destination error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to delete destination",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

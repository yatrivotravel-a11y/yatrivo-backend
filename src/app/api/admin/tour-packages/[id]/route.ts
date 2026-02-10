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
    deleteMultipleImages,
    generateUniqueFilename,
    isValidImageType,
} from "@/lib/storage";
import type { AdminApiResponse, TourPackage } from "@/types/admin";

// GET /api/admin/tour-packages/[id] - Get single tour package
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const packageDoc = await getDoc(doc(db, "tourPackages", id));

        if (!packageDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tour package not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const data = packageDoc.data();
        const tourPackage: TourPackage = {
            id: packageDoc.id,
            placeName: data.placeName,
            city: data.city,
            priceRange: data.priceRange,
            tripCategoryId: data.tripCategoryId,
            tripCategoryName: data.tripCategoryName,
            imageUrls: data.imageUrls || [],
            overview: data.overview,
            tourHighlights: data.tourHighlights || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return NextResponse.json(
            {
                success: true,
                data: tourPackage,
            } as AdminApiResponse<TourPackage>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get tour package error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch tour package",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// PUT /api/admin/tour-packages/[id] - Update tour package
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const formData = await request.formData();

        const placeName = formData.get("placeName") as string | null;
        const city = formData.get("city") as string | null;
        const priceRange = formData.get("priceRange") as string | null;
        const tripCategoryId = formData.get("tripCategoryId") as string | null;
        const overview = formData.get("overview") as string | null;
        const tourHighlightsStr = formData.get("tourHighlights") as string | null;
        const imagesToRemoveStr = formData.get("imagesToRemove") as string | null;

        // Get new images to add
        const newImageFiles: File[] = [];
        let imageIndex = 0;
        while (true) {
            const imageFile = formData.get(`newImage${imageIndex}`) as File | null;
            if (!imageFile || imageFile.size === 0) break;
            newImageFiles.push(imageFile);
            imageIndex++;
        }

        // Check if package exists
        const packageDoc = await getDoc(doc(db, "tourPackages", id));
        if (!packageDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tour package not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const updateData: any = {
            updatedAt: serverTimestamp(),
        };

        // Update text fields
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

        if (city) {
            updateData.city = city.trim();
        }

        if (priceRange) {
            updateData.priceRange = priceRange.trim();
        }

        if (overview) {
            if (overview.trim().length < 10 || overview.trim().length > 2000) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Overview must be between 10 and 2000 characters",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }
            updateData.overview = overview.trim();
        }

        // Update tour highlights
        if (tourHighlightsStr) {
            try {
                const tourHighlights = JSON.parse(tourHighlightsStr);
                if (!Array.isArray(tourHighlights)) {
                    throw new Error("Tour highlights must be an array");
                }
                updateData.tourHighlights = tourHighlights;
            } catch (error) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Tour highlights must be a valid JSON array",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }
        }

        // Update trip category
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

        // Handle image operations
        let currentImageUrls = packageDoc.data().imageUrls || [];

        // Remove images if specified
        if (imagesToRemoveStr) {
            try {
                const imagesToRemove: string[] = JSON.parse(imagesToRemoveStr);
                if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
                    // Delete from storage
                    await deleteMultipleImages(imagesToRemove);
                    // Remove from array
                    currentImageUrls = currentImageUrls.filter(
                        (url: string) => !imagesToRemove.includes(url)
                    );
                }
            } catch (error) {
                console.warn("Failed to remove images:", error);
            }
        }

        // Add new images if provided
        if (newImageFiles.length > 0) {
            // Validate new images
            for (const imageFile of newImageFiles) {
                if (!isValidImageType(imageFile.name)) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Invalid image type for ${imageFile.name}`,
                        } as AdminApiResponse,
                        { status: 400 }
                    );
                }

                if (imageFile.size > 5 * 1024 * 1024) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Image ${imageFile.name} exceeds 5MB limit`,
                        } as AdminApiResponse,
                        { status: 400 }
                    );
                }
            }

            // Upload new images
            const uploadPromises = newImageFiles.map(async (file) => {
                const imageBuffer = await file.arrayBuffer();
                const fileName = generateUniqueFilename(file.name);
                const storagePath = `tour-packages/${id}/${fileName}`;
                return uploadImage(Buffer.from(imageBuffer), storagePath);
            });

            const newImageUrls = await Promise.all(uploadPromises);
            currentImageUrls = [...currentImageUrls, ...newImageUrls];
        }

        // Update image URLs array
        if (imagesToRemoveStr || newImageFiles.length > 0) {
            updateData.imageUrls = currentImageUrls;
        }

        // Update document
        await updateDoc(doc(db, "tourPackages", id), updateData);

        // Fetch updated document
        const updatedDoc = await getDoc(doc(db, "tourPackages", id));
        const data = updatedDoc.data()!;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: updatedDoc.id,
                    placeName: data.placeName,
                    city: data.city,
                    priceRange: data.priceRange,
                    tripCategoryId: data.tripCategoryId,
                    tripCategoryName: data.tripCategoryName,
                    imageUrls: data.imageUrls || [],
                    overview: data.overview,
                    tourHighlights: data.tourHighlights || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as TourPackage,
                message: "Tour package updated successfully",
            } as AdminApiResponse<TourPackage>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Update tour package error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to update tour package",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// DELETE /api/admin/tour-packages/[id] - Delete tour package
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const packageDoc = await getDoc(doc(db, "tourPackages", id));

        if (!packageDoc.exists()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tour package not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        // Delete all images from storage
        const imageUrls = packageDoc.data().imageUrls || [];
        if (imageUrls.length > 0) {
            try {
                await deleteMultipleImages(imageUrls);
            } catch (error) {
                console.warn("Failed to delete some images:", error);
            }
        }

        // Delete document
        await deleteDoc(doc(db, "tourPackages", id));

        return NextResponse.json(
            {
                success: true,
                message: "Tour package deleted successfully",
            } as AdminApiResponse,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Delete tour package error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to delete tour package",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

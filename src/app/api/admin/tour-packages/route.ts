import { NextRequest, NextResponse } from "next/server";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    uploadMultipleImages,
    generateUniqueFilename,
    isValidImageType,
} from "@/lib/storage";
import type { AdminApiResponse, TourPackage } from "@/types/admin";

// POST /api/admin/tour-packages - Create new tour package
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const placeName = formData.get("placeName") as string;
        const city = formData.get("city") as string;
        const priceRange = formData.get("priceRange") as string;
        const tripCategoryId = formData.get("tripCategoryId") as string;
        const overview = formData.get("overview") as string;
        const tourHighlightsStr = formData.get("tourHighlights") as string;

        // Get all image files
        const imageFiles: File[] = [];
        let imageIndex = 0;
        while (true) {
            const imageFile = formData.get(`image${imageIndex}`) as File | null;
            if (!imageFile || imageFile.size === 0) break;
            imageFiles.push(imageFile);
            imageIndex++;
        }

        // Validate required fields
        if (!placeName || !city || !priceRange || !tripCategoryId || !overview) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Required fields: placeName, city, priceRange, tripCategoryId, overview",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Parse tour highlights
        let tourHighlights: string[] = [];
        if (tourHighlightsStr) {
            try {
                tourHighlights = JSON.parse(tourHighlightsStr);
                if (!Array.isArray(tourHighlights)) {
                    throw new Error("Tour highlights must be an array");
                }
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

        // Validate at least one image
        if (imageFiles.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "At least one image is required",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Validate field lengths
        if (placeName.trim().length < 2 || placeName.trim().length > 100) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Place name must be between 2 and 100 characters",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        if (overview.trim().length < 10 || overview.trim().length > 2000) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Overview must be between 10 and 2000 characters",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Verify trip category exists
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

        // Validate all images
        for (const imageFile of imageFiles) {
            if (!isValidImageType(imageFile.name)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Invalid image type for ${imageFile.name}. Only JPG, PNG, and WEBP are allowed`,
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

        // Create document first to get ID
        const packageRef = await addDoc(collection(db, "tourPackages"), {
            placeName: placeName.trim(),
            city: city.trim(),
            priceRange: priceRange.trim(),
            tripCategoryId,
            tripCategoryName: categoryDoc.data().name,
            imageUrls: [], // Temporary
            overview: overview.trim(),
            tourHighlights,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Upload all images to Firebase Storage
        const imageBuffers = await Promise.all(
            imageFiles.map((file) => file.arrayBuffer())
        );
        const imageBlobs = imageBuffers.map((buffer) => Buffer.from(buffer));
        const basePath = `tour-packages/${packageRef.id}`;
        const imageUrls = await uploadMultipleImages(imageBlobs, basePath);

        // Update document with image URLs
        const { updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "tourPackages", packageRef.id), {
            imageUrls,
            updatedAt: serverTimestamp(),
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: packageRef.id,
                    placeName: placeName.trim(),
                    city: city.trim(),
                    priceRange: priceRange.trim(),
                    tripCategoryId,
                    tripCategoryName: categoryDoc.data().name,
                    imageUrls,
                    overview: overview.trim(),
                    tourHighlights,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as TourPackage,
                message: "Tour package created successfully",
            } as AdminApiResponse<TourPackage>,
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create tour package error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create tour package",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// GET /api/admin/tour-packages - List all tour packages
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const city = searchParams.get("city");

        const packagesRef = collection(db, "tourPackages");
        let q;

        if (categoryId) {
            q = query(
                packagesRef,
                where("tripCategoryId", "==", categoryId),
                orderBy("createdAt", "desc")
            );
        } else if (city) {
            q = query(
                packagesRef,
                where("city", "==", city),
                orderBy("createdAt", "desc")
            );
        } else {
            q = query(packagesRef, orderBy("createdAt", "desc"));
        }

        const querySnapshot = await getDocs(q);

        const packages: TourPackage[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
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
        });

        return NextResponse.json(
            {
                success: true,
                data: packages,
                message: `Found ${packages.length} tour packages`,
            } as AdminApiResponse<TourPackage[]>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get tour packages error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch tour packages",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

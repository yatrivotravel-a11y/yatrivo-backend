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
import { uploadImage, generateUniqueFilename, isValidImageType } from "@/lib/storage";
import type { AdminApiResponse, Destination } from "@/types/admin";

// POST /api/admin/destinations - Create new destination
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const placeName = formData.get("placeName") as string;
        const city = formData.get("city") as string;
        const tripCategoryId = formData.get("tripCategoryId") as string;
        const imageFile = formData.get("image") as File;

        // Validate input
        if (!placeName || !city || !tripCategoryId || !imageFile) {
            return NextResponse.json(
                {
                    success: false,
                    error: "All fields are required: placeName, city, tripCategoryId, image",
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

        if (city.trim().length < 2 || city.trim().length > 50) {
            return NextResponse.json(
                {
                    success: false,
                    error: "City name must be between 2 and 50 characters",
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

        // Create document first to get ID
        const destinationRef = await addDoc(collection(db, "destinations"), {
            placeName: placeName.trim(),
            city: city.trim(),
            tripCategoryId,
            tripCategoryName: categoryDoc.data().name,
            imageUrl: "", // Temporary
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Upload image to Firebase Storage
        const imageBuffer = await imageFile.arrayBuffer();
        const fileName = generateUniqueFilename(imageFile.name);
        const storagePath = `destinations/${destinationRef.id}/${fileName}`;
        const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);

        // Update document with image URL
        const { updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "destinations", destinationRef.id), {
            imageUrl,
            updatedAt: serverTimestamp(),
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: destinationRef.id,
                    placeName: placeName.trim(),
                    city: city.trim(),
                    tripCategoryId,
                    tripCategoryName: categoryDoc.data().name,
                    imageUrl,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Destination,
                message: "Destination created successfully",
            } as AdminApiResponse<Destination>,
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create destination error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create destination",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// GET /api/admin/destinations - List all destinations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");

        const destinationsRef = collection(db, "destinations");
        let q;

        if (categoryId) {
            // Filter by category
            q = query(
                destinationsRef,
                where("tripCategoryId", "==", categoryId),
                orderBy("createdAt", "desc")
            );
        } else {
            // Get all destinations
            q = query(destinationsRef, orderBy("createdAt", "desc"));
        }

        const querySnapshot = await getDocs(q);

        const destinations: Destination[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                placeName: data.placeName,
                city: data.city,
                tripCategoryId: data.tripCategoryId,
                tripCategoryName: data.tripCategoryName,
                imageUrl: data.imageUrl,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        return NextResponse.json(
            {
                success: true,
                data: destinations,
                message: `Found ${destinations.length} destinations`,
            } as AdminApiResponse<Destination[]>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get destinations error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch destinations",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

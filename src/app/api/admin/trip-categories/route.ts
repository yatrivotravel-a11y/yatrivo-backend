import { NextRequest, NextResponse } from "next/server";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage, generateUniqueFilename, isValidImageType } from "@/lib/storage";
import type { AdminApiResponse, TripCategory } from "@/types/admin";

// POST /api/admin/trip-categories - Create new trip category
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const imageFile = formData.get("image") as File;

        // Validate input
        if (!name || !imageFile) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category name and image are required",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Validate name length
        if (name.trim().length < 2 || name.trim().length > 50) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category name must be between 2 and 50 characters",
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

        // Check file size (5MB limit)
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
        const categoryRef = await addDoc(collection(db, "tripCategories"), {
            name: name.trim(),
            imageUrl: "", // Temporary, will update
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Upload image to Firebase Storage
        const imageBuffer = await imageFile.arrayBuffer();
        const fileName = generateUniqueFilename(imageFile.name);
        const storagePath = `trip-categories/${categoryRef.id}/${fileName}`;
        const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);

        // Update document with image URL
        const { updateDoc, doc } = await import("firebase/firestore");
        await updateDoc(doc(db, "tripCategories", categoryRef.id), {
            imageUrl,
            updatedAt: serverTimestamp(),
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: categoryRef.id,
                    name: name.trim(),
                    imageUrl,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as TripCategory,
                message: "Trip category created successfully",
            } as AdminApiResponse<TripCategory>,
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create trip category error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create trip category",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

// GET /api/admin/trip-categories - List all trip categories
export async function GET(request: NextRequest) {
    try {
        const categoriesRef = collection(db, "tripCategories");
        const q = query(categoriesRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const categories: TripCategory[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                imageUrl: data.imageUrl,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        return NextResponse.json(
            {
                success: true,
                data: categories,
                message: `Found ${categories.length} trip categories`,
            } as AdminApiResponse<TripCategory[]>,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get trip categories error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch trip categories",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

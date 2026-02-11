import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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

        // Create database record first (with temporary image URL)
        const { data: categoryData, error: insertError } = await supabaseAdmin
            .from("trip_categories")
            .insert({
                name: name.trim(),
                image_url: "",
            })
            .select()
            .single();

        if (insertError || !categoryData) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to create trip category",
                } as AdminApiResponse,
                { status: 500 }
            );
        }

        // Upload image to Supabase Storage
        const imageBuffer = await imageFile.arrayBuffer();
        const fileName = generateUniqueFilename(imageFile.name);
        const storagePath = `trip-categories/${categoryData.id}/${fileName}`;
        const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);

        // Update record with image URL
        const { data: updatedCategory, error: updateError } = await supabaseAdmin
            .from("trip_categories")
            .update({ image_url: imageUrl })
            .eq("id", categoryData.id)
            .select()
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
        }

        const finalCategory = updatedCategory || categoryData;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: finalCategory.id,
                    name: finalCategory.name,
                    imageUrl: imageUrl,
                    createdAt: new Date(finalCategory.created_at),
                    updatedAt: new Date(finalCategory.updated_at),
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
        const { data: categories, error } = await supabaseAdmin
            .from("trip_categories")
            .select("*")
            .order("created_at", { ascending: false })
            .range(0, 999);

        if (error) {
            throw error;
        }

        const formattedCategories: TripCategory[] = (categories || []).map((cat) => ({
            id: cat.id,
            name: cat.name,
            imageUrl: cat.image_url,
            createdAt: new Date(cat.created_at),
            updatedAt: new Date(cat.updated_at),
        }));

        return NextResponse.json(
            {
                success: true,
                data: formattedCategories,
                message: `Found ${formattedCategories.length} trip categories`,
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

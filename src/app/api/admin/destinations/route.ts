import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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
        const { data: category, error: categoryError } = await supabaseAdmin
            .from("trip_categories")
            .select("*")
            .eq("id", tripCategoryId)
            .single();

        if (categoryError || !category) {
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

        // Create database record first
        const { data: destinationData, error: insertError } = await supabaseAdmin
            .from("destinations")
            .insert({
                place_name: placeName.trim(),
                city: city.trim(),
                trip_category_id: tripCategoryId,
                trip_category_name: category.name,
                image_url: "",
            })
            .select()
            .single();

        if (insertError || !destinationData) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to create destination",
                } as AdminApiResponse,
                { status: 500 }
            );
        }

        // Upload image to Supabase Storage
        const imageBuffer = await imageFile.arrayBuffer();
        const fileName = generateUniqueFilename(imageFile.name);
        const storagePath = `destinations/${destinationData.id}/${fileName}`;
        const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);

        // Update record with image URL
        const { data: updatedDestination, error: updateError } = await supabaseAdmin
            .from("destinations")
            .update({ image_url: imageUrl })
            .eq("id", destinationData.id)
            .select()
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
        }

        const finalDestination = updatedDestination || destinationData;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: finalDestination.id,
                    placeName: finalDestination.place_name,
                    city: finalDestination.city,
                    tripCategoryId: finalDestination.trip_category_id,
                    tripCategoryName: finalDestination.trip_category_name,
                    imageUrl: imageUrl,
                    createdAt: new Date(finalDestination.created_at),
                    updatedAt: new Date(finalDestination.updated_at),
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

        let query = supabaseAdmin
            .from("destinations")
            .select("*")
            .order("created_at", { ascending: false })
            .range(0, 999);

        if (categoryId) {
            query = query.eq("trip_category_id", categoryId);
        }

        const { data: destinations, error } = await query;

        if (error) {
            throw error;
        }

        const formattedDestinations: Destination[] = (destinations || []).map((dest) => ({
            id: dest.id,
            placeName: dest.place_name,
            city: dest.city,
            tripCategoryId: dest.trip_category_id,
            tripCategoryName: dest.trip_category_name,
            imageUrl: dest.image_url,
            createdAt: new Date(dest.created_at),
            updatedAt: new Date(dest.updated_at),
        }));

        return NextResponse.json(
            {
                success: true,
                data: formattedDestinations,
                message: `Found ${formattedDestinations.length} destinations`,
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

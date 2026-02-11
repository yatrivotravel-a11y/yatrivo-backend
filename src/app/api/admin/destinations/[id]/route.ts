import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data: destination, error } = await supabaseAdmin
            .from("destinations")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !destination) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Destination not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: destination.id,
                    placeName: destination.place_name,
                    city: destination.city,
                    tripCategoryId: destination.trip_category_id,
                    tripCategoryName: destination.trip_category_name,
                    imageUrl: destination.image_url,
                    createdAt: new Date(destination.created_at),
                    updatedAt: new Date(destination.updated_at),
                } as Destination,
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const placeName = formData.get("placeName") as string | null;
        const city = formData.get("city") as string | null;
        const tripCategoryId = formData.get("tripCategoryId") as string | null;
        const imageFile = formData.get("image") as File | null;

        // Check if destination exists
        const { data: existingDest, error: fetchError } = await supabaseAdmin
            .from("destinations")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !existingDest) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Destination not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const updateData: any = {};

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
            updateData.place_name = placeName.trim();
        }

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

        if (tripCategoryId) {
            const { data: category, error: catError } = await supabaseAdmin
                .from("trip_categories")
                .select("*")
                .eq("id", tripCategoryId)
                .single();

            if (catError || !category) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid trip category ID",
                    } as AdminApiResponse,
                    { status: 400 }
                );
            }
            updateData.trip_category_id = tripCategoryId;
            updateData.trip_category_name = category.name;
        }

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

            if (existingDest.image_url) {
                try {
                    await deleteImage(existingDest.image_url);
                } catch (error) {
                    console.warn("Failed to delete old image:", error);
                }
            }

            const imageBuffer = await imageFile.arrayBuffer();
            const fileName = generateUniqueFilename(imageFile.name);
            const storagePath = `destinations/${id}/${fileName}`;
            const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);
            updateData.image_url = imageUrl;
        }

        const { data: updated, error: updateError } = await supabaseAdmin
            .from("destinations")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: updated.id,
                    placeName: updated.place_name,
                    city: updated.city,
                    tripCategoryId: updated.trip_category_id,
                    tripCategoryName: updated.trip_category_name,
                    imageUrl: updated.image_url,
                    createdAt: new Date(updated.created_at),
                    updatedAt: new Date(updated.updated_at),
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data: destination, error: fetchError } = await supabaseAdmin
            .from("destinations")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !destination) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Destination not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        if (destination.image_url) {
            try {
                await deleteImage(destination.image_url);
            } catch (error) {
                console.warn("Failed to delete image:", error);
            }
        }

        const { error: deleteError } = await supabaseAdmin
            .from("destinations")
            .delete()
            .eq("id", id);

        if (deleteError) {
            throw deleteError;
        }

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

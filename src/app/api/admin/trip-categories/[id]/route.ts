import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing or invalid authorization header',
                } as AdminApiResponse,
                { status: 401 }
            );
        }

        // Extract the token
        const token = authHeader.substring(7);

        // Verify the token and get the user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid or expired token',
                } as AdminApiResponse,
                { status: 401 }
            );
        }

        const { id } = await params;
        const { data: category, error } = await supabaseAdmin
            .from("trip_categories")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !category) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trip category not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: category.id,
                    name: category.name,
                    imageUrl: category.image_url,
                    createdAt: new Date(category.created_at),
                    updatedAt: new Date(category.updated_at),
                } as TripCategory,
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing or invalid authorization header',
                } as AdminApiResponse,
                { status: 401 }
            );
        }

        // Extract the token
        const token = authHeader.substring(7);

        // Verify the token and get the user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid or expired token',
                } as AdminApiResponse,
                { status: 401 }
            );
        }

        const { id } = await params;
        const formData = await request.formData();
        const name = formData.get("name") as string | null;
        const imageFile = formData.get("image") as File | null;

        // Check if category exists
        const { data: existingCategory, error: fetchError } = await supabaseAdmin
            .from("trip_categories")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trip category not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        const updateData: any = {};

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
            if (existingCategory.image_url) {
                try {
                    await deleteImage(existingCategory.image_url);
                } catch (error) {
                    console.warn("Failed to delete old image:", error);
                }
            }

            // Upload new image
            const imageBuffer = await imageFile.arrayBuffer();
            const fileName = generateUniqueFilename(imageFile.name);
            const storagePath = `trip-categories/${id}/${fileName}`;
            const imageUrl = await uploadImage(Buffer.from(imageBuffer), storagePath);
            updateData.image_url = imageUrl;
        }

        // Update document
        const { data: updatedCategory, error: updateError } = await supabaseAdmin
            .from("trip_categories")
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
                    id: updatedCategory.id,
                    name: updatedCategory.name,
                    imageUrl: updatedCategory.image_url,
                    createdAt: new Date(updatedCategory.created_at),
                    updatedAt: new Date(updatedCategory.updated_at),
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing or invalid authorization header',
                } as AdminApiResponse,
                { status: 401 }
            );
        }

        // Extract the token
        const token = authHeader.substring(7);

        // Verify the token and get the user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid or expired token',
                } as AdminApiResponse,
                { status: 401 }
            );
        }

        const { id } = await params;
        const { data: category, error: fetchError } = await supabaseAdmin
            .from("trip_categories")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !category) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trip category not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        // Delete image from storage
        if (category.image_url) {
            try {
                await deleteImage(category.image_url);
            } catch (error) {
                console.warn("Failed to delete image:", error);
            }
        }

        // Delete document
        const { error: deleteError } = await supabaseAdmin
            .from("trip_categories")
            .delete()
            .eq("id", id);

        if (deleteError) {
            throw deleteError;
        }

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

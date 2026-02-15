import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
    uploadMultipleImages,
    deleteMultipleImages,
    deleteImage,
    generateUniqueFilename,
    isValidImageType,
} from "@/lib/storage";
import type { AdminApiResponse, TourPackage } from "@/types/admin";

// GET /api/admin/tour-packages/[id] - Get single tour package
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
        const { data: pkg, error } = await supabaseAdmin
            .from("tour_packages")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !pkg) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tour package not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: pkg.id,
                    placeName: pkg.place_name,
                    city: pkg.city,
                    priceRange: pkg.price_range,
                    tripCategoryId: pkg.trip_category_id,
                    tripCategoryName: pkg.trip_category_name,
                    imageUrls: pkg.image_urls || [],
                    overview: pkg.overview,
                    tourHighlights: pkg.tour_highlights || [],
                    createdAt: new Date(pkg.created_at),
                    updatedAt: new Date(pkg.updated_at),
                } as TourPackage,
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
        const placeName = formData.get("placeName") as string | null;
        const city = formData.get("city") as string | null;
        const priceRange = formData.get("priceRange") as string | null;
        const tripCategoryId = formData.get("tripCategoryId") as string | null;
        const overview = formData.get("overview") as string | null;
        const tourHighlightsStr = formData.get("tourHighlights") as string | null;
        const imagesToRemoveStr = formData.get("imagesToRemove") as string | null;

        // Get new images
        const newImageFiles: File[] = [];
        let imageIndex = 0;
        while (true) {
            const imageFile = formData.get(`newImage${imageIndex}`) as File | null;
            if (!imageFile || imageFile.size === 0) break;
            newImageFiles.push(imageFile);
            imageIndex++;
        }

        // Check if package exists
        const { data: existingPkg, error: fetchError } = await supabaseAdmin
            .from("tour_packages")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !existingPkg) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tour package not found",
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
            updateData.city = city.trim();
        }

        if (priceRange) {
            updateData.price_range = priceRange.trim();
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

        if (tourHighlightsStr) {
            try {
                const highlights = JSON.parse(tourHighlightsStr);
                if (!Array.isArray(highlights)) {
                    throw new Error("Must be an array");
                }
                updateData.tour_highlights = highlights;
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

        // Handle image updates
        let currentImageUrls = [...(existingPkg.image_urls || [])];

        // Remove images if requested
        if (imagesToRemoveStr) {
            try {
                const imagesToRemove: string[] = JSON.parse(imagesToRemoveStr);
                if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
                    await deleteMultipleImages(imagesToRemove);
                    currentImageUrls = currentImageUrls.filter(
                        (url) => !imagesToRemove.includes(url)
                    );
                }
            } catch (error) {
                console.warn("Failed to remove images:", error);
            }
        }

        // Add new images
        if (newImageFiles.length > 0) {
            for (const file of newImageFiles) {
                if (!isValidImageType(file.name)) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Invalid image type for ${file.name}`,
                        } as AdminApiResponse,
                        { status: 400 }
                    );
                }
                if (file.size > 5 * 1024 * 1024) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Image ${file.name} exceeds 5MB`,
                        } as AdminApiResponse,
                        { status: 400 }
                    );
                }
            }

            const imageBuffers = await Promise.all(
                newImageFiles.map((file) => file.arrayBuffer())
            );
            const imageBlobs = imageBuffers.map((buffer) => Buffer.from(buffer));
            const basePath = `tour-packages/${id}`;
            const newImageUrls = await uploadMultipleImages(imageBlobs, basePath);
            currentImageUrls = [...currentImageUrls, ...newImageUrls];
        }

        updateData.image_urls = currentImageUrls;

        const { data: updated, error: updateError } = await supabaseAdmin
            .from("tour_packages")
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
                    priceRange: updated.price_range,
                    tripCategoryId: updated.trip_category_id,
                    tripCategoryName: updated.trip_category_name,
                    imageUrls: updated.image_urls || [],
                    overview: updated.overview,
                    tourHighlights: updated.tour_highlights || [],
                    createdAt: new Date(updated.created_at),
                    updatedAt: new Date(updated.updated_at),
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
        const { data: pkg, error: fetchError } = await supabaseAdmin
            .from("tour_packages")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !pkg) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tour package not found",
                } as AdminApiResponse,
                { status: 404 }
            );
        }

        // Delete all images
        if (pkg.image_urls && pkg.image_urls.length > 0) {
            try {
                await deleteMultipleImages(pkg.image_urls);
            } catch (error) {
                console.warn("Failed to delete images:", error);
            }
        }

        const { error: deleteError } = await supabaseAdmin
            .from("tour_packages")
            .delete()
            .eq("id", id);

        if (deleteError) {
            throw deleteError;
        }

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

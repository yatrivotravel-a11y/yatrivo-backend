import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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

        // Create database record first
        const { data: packageData, error: insertError } = await supabaseAdmin
            .from("tour_packages")
            .insert({
                place_name: placeName.trim(),
                city: city.trim(),
                price_range: priceRange.trim(),
                trip_category_id: tripCategoryId,
                trip_category_name: category.name,
                image_urls: [],
                overview: overview.trim(),
                tour_highlights: tourHighlights,
            })
            .select()
            .single();

        if (insertError || !packageData) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to create tour package",
                } as AdminApiResponse,
                { status: 500 }
            );
        }

        // Upload all images to Supabase Storage
        const imageBuffers = await Promise.all(
            imageFiles.map((file) => file.arrayBuffer())
        );
        const imageBlobs = imageBuffers.map((buffer) => Buffer.from(buffer));
        const basePath = `tour-packages/${packageData.id}`;
        const imageUrls = await uploadMultipleImages(imageBlobs, basePath);

        // Update record with image URLs
        const { data: updatedPackage, error: updateError } = await supabaseAdmin
            .from("tour_packages")
            .update({ image_urls: imageUrls })
            .eq("id", packageData.id)
            .select()
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
        }

        const finalPackage = updatedPackage || packageData;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: finalPackage.id,
                    placeName: finalPackage.place_name,
                    city: finalPackage.city,
                    priceRange: finalPackage.price_range,
                    tripCategoryId: finalPackage.trip_category_id,
                    tripCategoryName: finalPackage.trip_category_name,
                    imageUrls: imageUrls,
                    overview: finalPackage.overview,
                    tourHighlights: finalPackage.tour_highlights,
                    createdAt: new Date(finalPackage.created_at),
                    updatedAt: new Date(finalPackage.updated_at),
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

        let query = supabaseAdmin
            .from("tour_packages")
            .select("*")
            .order("created_at", { ascending: false })
            .range(0, 999);

        if (categoryId) {
            query = query.eq("trip_category_id", categoryId);
        } else if (city) {
            query = query.eq("city", city);
        }

        const { data: packages, error } = await query;

        if (error) {
            throw error;
        }

        const formattedPackages: TourPackage[] = (packages || []).map((pkg) => ({
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
        }));

        return NextResponse.json(
            {
                success: true,
                data: formattedPackages,
                message: `Found ${formattedPackages.length} tour packages`,
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

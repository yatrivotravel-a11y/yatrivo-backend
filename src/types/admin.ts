// Admin content management types for tour packages, destinations, and trip categories

import { Timestamp } from "firebase/firestore";

// Trip Category Types
export interface TripCategory {
    id: string;
    name: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TripCategoryFirestore {
    id: string;
    name: string;
    imageUrl: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateTripCategoryRequest {
    name: string;
    image: File;
}

export interface UpdateTripCategoryRequest {
    name?: string;
    image?: File;
}

// Destination Types
export interface Destination {
    id: string;
    placeName: string;
    city: string;
    imageUrl: string;
    tripCategoryId: string;
    tripCategoryName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DestinationFirestore {
    id: string;
    placeName: string;
    city: string;
    imageUrl: string;
    tripCategoryId: string;
    tripCategoryName: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateDestinationRequest {
    placeName: string;
    city: string;
    tripCategoryId: string;
    image: File;
}

export interface UpdateDestinationRequest {
    placeName?: string;
    city?: string;
    tripCategoryId?: string;
    image?: File;
}

// Tour Package Types
export interface TourPackage {
    id: string;
    placeName: string;
    city: string;
    priceRange: string;
    tripCategoryId: string;
    tripCategoryName: string;
    imageUrls: string[];
    overview: string;
    tourHighlights: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TourPackageFirestore {
    id: string;
    placeName: string;
    city: string;
    priceRange: string;
    tripCategoryId: string;
    tripCategoryName: string;
    imageUrls: string[];
    overview: string;
    tourHighlights: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateTourPackageRequest {
    placeName: string;
    city: string;
    priceRange: string;
    tripCategoryId: string;
    overview: string;
    tourHighlights: string[];
    images: File[];
}

export interface UpdateTourPackageRequest {
    placeName?: string;
    city?: string;
    priceRange?: string;
    tripCategoryId?: string;
    overview?: string;
    tourHighlights?: string[];
    imagesToAdd?: File[];
    imagesToRemove?: string[];
}

// API Response Types
export interface AdminApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

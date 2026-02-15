import { ApiResponse } from "@/types";
import type { TripCategory, Destination, TourPackage } from "@/types/admin";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Generic fetch wrapper
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "An error occurred",
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ----- AUTHENTICATION API -----

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    uid: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("/auth", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function signup(data: {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
}): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function deleteAccount(userId: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/auth/delete", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

// ----- TRIP CATEGORIES API -----

export async function getTripCategories(): Promise<ApiResponse<TripCategory[]>> {
  return apiRequest<TripCategory[]>("/admin/trip-categories");
}

export async function getTripCategory(id: string): Promise<ApiResponse<TripCategory>> {
  return apiRequest<TripCategory>(`/admin/trip-categories/${id}`);
}

export async function createTripCategory(formData: FormData): Promise<ApiResponse<TripCategory>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/trip-categories`, {
    method: "POST",
    headers,
    body: formData, // FormData handles its own Content-Type
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Failed to create trip category",
    };
  }

  return {
    success: true,
    data: data.data,
    message: data.message,
  };
}

export async function updateTripCategory(id: string, formData: FormData): Promise<ApiResponse<TripCategory>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/trip-categories/${id}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Failed to update trip category",
    };
  }

  return {
    success: true,
    data: data.data,
    message: data.message,
  };
}

export async function deleteTripCategory(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/admin/trip-categories/${id}`, {
    method: "DELETE",
  });
}

// ----- DESTINATIONS API -----

export async function getDestinations(categoryId?: string): Promise<ApiResponse<Destination[]>> {
  const url = categoryId ? `/admin/destinations?categoryId=${categoryId}` : "/admin/destinations";
  return apiRequest<Destination[]>(url);
}

export async function getDestination(id: string): Promise<ApiResponse<Destination>> {
  return apiRequest<Destination>(`/admin/destinations/${id}`);
}

export async function createDestination(formData: FormData): Promise<ApiResponse<Destination>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/destinations`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Failed to create destination",
    };
  }

  return {
    success: true,
    data: data.data,
    message: data.message,
  };
}

export async function updateDestination(id: string, formData: FormData): Promise<ApiResponse<Destination>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/destinations/${id}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Failed to update destination",
    };
  }

  return {
    success: true,
    data: data.data,
    message: data.message,
  };
}

export async function deleteDestination(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/admin/destinations/${id}`, {
    method: "DELETE",
  });
}

// ----- TOUR PACKAGES API -----

export async function getTourPackages(filters?: { categoryId?: string; city?: string }): Promise<ApiResponse<TourPackage[]>> {
  let url = "/admin/tour-packages";
  const params = new URLSearchParams();
  
  if (filters?.categoryId) params.append("categoryId", filters.categoryId);
  if (filters?.city) params.append("city", filters.city);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return apiRequest<TourPackage[]>(url);
}

export async function getTourPackage(id: string): Promise<ApiResponse<TourPackage>> {
  return apiRequest<TourPackage>(`/admin/tour-packages/${id}`);
}

export async function createTourPackage(formData: FormData): Promise<ApiResponse<TourPackage>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/tour-packages`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Failed to create tour package",
    };
  }

  return {
    success: true,
    data: data.data,
    message: data.message,
  };
}

export async function updateTourPackage(id: string, formData: FormData): Promise<ApiResponse<TourPackage>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/tour-packages/${id}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Failed to update tour package",
    };
  }

  return {
    success: true,
    data: data.data,
    message: data.message,
  };
}

export async function deleteTourPackage(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/admin/tour-packages/${id}`, {
    method: "DELETE",
  });
}

// ----- USERS API -----

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUsers(): Promise<ApiResponse<UserData[]>> {
  return apiRequest<UserData[]>("/users");
}

export async function getUser(id: string): Promise<ApiResponse<UserData>> {
  return apiRequest<UserData>(`/users/${id}`);
}

export async function createUser(data: { email: string; name: string }): Promise<ApiResponse<UserData>> {
  return apiRequest<UserData>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: Partial<UserData>): Promise<ApiResponse<UserData>> {
  return apiRequest<UserData>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/users/${id}`, {
    method: "DELETE",
  });
}

// ----- BOOKINGS API -----

export interface BookingData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMobile: string;
  packageId: string;
  packageName: string;
  packageCity: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface UserBookingsResponse {
  message: string;
  bookings: BookingData[];
  count: number;
}

export interface BookingsResponse {
  message: string;
  bookings: BookingData[];
  stats: BookingStats;
}

export async function getBookings(filters?: { status?: string; userId?: string }): Promise<ApiResponse<UserBookingsResponse>> {
  let url = "/bookings";
  const params = new URLSearchParams();
  
  if (filters?.status) params.append("status", filters.status);
  if (filters?.userId) params.append("userId", filters.userId);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return apiRequest<UserBookingsResponse>(url);
}

export async function getAdminBookings(filters?: { status?: string; userId?: string; limit?: number }): Promise<ApiResponse<BookingsResponse>> {
  let url = "/admin/bookings";
  const params = new URLSearchParams();
  
  if (filters?.status) params.append("status", filters.status);
  if (filters?.userId) params.append("userId", filters.userId);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return apiRequest<BookingsResponse>(url);
}

export async function getBooking(id: string): Promise<ApiResponse<BookingData>> {
  return apiRequest<BookingData>(`/bookings/${id}`);
}

export async function createBooking(data: { packageId: string }): Promise<ApiResponse<BookingData>> {
  return apiRequest<BookingData>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBookingStatus(id: string, status: string): Promise<ApiResponse<BookingData>> {
  return apiRequest<BookingData>(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteBooking(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/bookings/${id}`, {
    method: "DELETE",
  });
}

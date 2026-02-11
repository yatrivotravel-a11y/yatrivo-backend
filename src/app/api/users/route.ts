import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { ApiResponse } from "@/types";

interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Fetch users from Supabase Auth (not from a custom users table)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }

    // Transform to match the expected format
    const formattedUsers: UserResponse[] = (users || []).map((user) => ({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || 'Unknown',
      avatar: user.user_metadata?.avatar_url,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      message: `Found ${formattedUsers.length} users`,
    } as ApiResponse<UserResponse[]>);
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch users",
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and name are required",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Note: Users are typically created through auth.signup
    // This endpoint is for admin purposes only
    return NextResponse.json(
      {
        success: false,
        error: "User creation should be done through /api/auth/signup",
      } as ApiResponse,
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create user",
      } as ApiResponse,
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { AdminApiResponse } from "@/types/admin";

// POST /api/auth - Login endpoint
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Auth API - Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPreview: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials missing in production!');
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error. Please contact support.",
        } as AdminApiResponse,
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        } as AdminApiResponse,
        { status: 400 }
      );
    }

    console.log('Auth API - Attempting login for:', email);

    // Authenticate with Supabase
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Supabase sign-in error:', {
        message: signInError.message,
        status: signInError.status,
        name: signInError.name
      });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        } as AdminApiResponse,
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
        } as AdminApiResponse,
        { status: 401 }
      );
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !userProfile) {
      // User authenticated but profile not found - return basic info
      return NextResponse.json(
        {
          success: true,
          data: {
            user: {
              uid: authData.user.id,
              fullName: authData.user.user_metadata?.full_name || "",
              mobileNumber: authData.user.user_metadata?.mobile_number || "",
              email: authData.user.email || "",
              createdAt: new Date(authData.user.created_at),
              updatedAt: new Date(),
            },
            token: authData.session.access_token,
          },
          message: "Login successful",
        } as AdminApiResponse,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            uid: userProfile.id,
            fullName: userProfile.full_name,
            mobileNumber: userProfile.mobile_number,
            email: userProfile.email,
            createdAt: new Date(userProfile.created_at),
            updatedAt: new Date(userProfile.updated_at),
          },
          token: authData.session.access_token,
        },
        message: "Login successful",
      } as AdminApiResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Authentication failed",
      } as AdminApiResponse,
      { status: 500 }
    );
  }
}

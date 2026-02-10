import { NextRequest, NextResponse } from "next/server";

// POST /api/auth - Login endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Mock authentication - replace with actual authentication logic
    // Check credentials against database
    const user = {
      id: "1",
      email,
      name: "John Doe",
    };

    // Generate token (use proper JWT implementation in production)
    const token = "mock-jwt-token";

    return NextResponse.json({
      success: true,
      data: {
        user,
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 }
    );
  }
}

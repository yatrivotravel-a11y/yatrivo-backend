import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types";

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database query
    const users: User[] = [
      {
        id: "1",
        email: "user1@example.com",
        name: "John Doe",
        avatar: "/avatars/user1.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        email: "user2@example.com",
        name: "Jane Smith",
        avatar: "/avatars/user2.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
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
        },
        { status: 400 }
      );
    }

    // Mock user creation - replace with actual database operation
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 }
    );
  }
}

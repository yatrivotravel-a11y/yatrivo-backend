import { NextRequest, NextResponse } from "next/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { LoginRequest, AuthResponse } from "@/types/user";

// POST /api/auth - Login endpoint
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        } as AuthResponse,
        { status: 404 }
      );
    }

    const userProfile = userDoc.data();

    // Get ID token
    const token = await user.getIdToken();

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            uid: user.uid,
            fullName: userProfile.fullName,
            mobileNumber: userProfile.mobileNumber,
            email: userProfile.email,
            createdAt: userProfile.createdAt?.toDate() || new Date(),
            updatedAt: userProfile.updatedAt?.toDate() || new Date(),
          },
          token,
        },
        message: "Login successful",
      } as AuthResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);

    // Handle Firebase specific errors
    let errorMessage = "Authentication failed";
    let statusCode = 401;

    if (error.code === "auth/user-not-found") {
      errorMessage = "User not found";
      statusCode = 404;
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Invalid email or password";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "User account has been disabled";
      statusCode = 403;
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed login attempts. Please try again later";
      statusCode = 429;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as AuthResponse,
      { status: statusCode }
    );
  }
}

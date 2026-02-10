import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { SignUpRequest, AuthResponse } from "@/types/user";

// POST /api/auth/signup - Create new user account
export async function POST(request: NextRequest) {
    try {
        const body: SignUpRequest = await request.json();
        const { fullName, mobileNumber, email, password } = body;

        // Validate input
        if (!fullName || !mobileNumber || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "All fields are required: fullName, mobileNumber, email, password",
                } as AuthResponse,
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid email format",
                } as AuthResponse,
                { status: 400 }
            );
        }

        // Validate mobile number format (basic validation)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobileNumber)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid mobile number. Must be 10 digits",
                } as AuthResponse,
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password must be at least 6 characters long",
                } as AuthResponse,
                { status: 400 }
            );
        }

        // Create Firebase Authentication user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        // Store user profile in Firestore
        const userProfile = {
            uid: user.uid,
            fullName,
            mobileNumber,
            email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", user.uid), userProfile);

        // Get ID token
        const token = await user.getIdToken();

        return NextResponse.json(
            {
                success: true,
                data: {
                    user: {
                        uid: user.uid,
                        fullName,
                        mobileNumber,
                        email,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    token,
                },
                message: "User registered successfully",
            } as AuthResponse,
            { status: 201 }
        );
    } catch (error: any) {
        console.error("SignUp error:", error);

        // Handle Firebase specific errors
        let errorMessage = "Registration failed";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "Email already registered";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "Password is too weak";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email address";
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
            } as AuthResponse,
            { status: 400 }
        );
    }
}

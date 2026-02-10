import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { ForgotPasswordRequest, PasswordResetResponse } from "@/types/user";

// POST /api/auth/forgot-password - Send password reset email
export async function POST(request: NextRequest) {
    try {
        const body: ForgotPasswordRequest = await request.json();
        const { email } = body;

        // Validate input
        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Email is required",
                } as PasswordResetResponse,
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
                } as PasswordResetResponse,
                { status: 400 }
            );
        }

        // Send password reset email
        await sendPasswordResetEmail(auth, email);

        return NextResponse.json(
            {
                success: true,
                message: "Password reset email sent successfully. Please check your inbox.",
            } as PasswordResetResponse,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Forgot password error:", error);

        // Handle Firebase specific errors
        let errorMessage = "Failed to send password reset email";
        let statusCode = 500;

        if (error.code === "auth/user-not-found") {
            // For security, we don't reveal if the email exists or not
            // Still return success to prevent email enumeration
            return NextResponse.json(
                {
                    success: true,
                    message: "If the email exists, a password reset link has been sent.",
                } as PasswordResetResponse,
                { status: 200 }
            );
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email address";
            statusCode = 400;
        } else if (error.code === "auth/too-many-requests") {
            errorMessage = "Too many requests. Please try again later";
            statusCode = 429;
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
            } as PasswordResetResponse,
            { status: statusCode }
        );
    }
}

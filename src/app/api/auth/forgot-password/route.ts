import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { AdminApiResponse } from "@/types/admin";

// POST /api/auth/forgot-password - Send password reset email
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validate input
        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Email is required",
                } as AdminApiResponse,
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
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
        });

        if (error) {
            console.error("Password reset error:", error);
            // For security, we don't reveal if the email exists
            return NextResponse.json(
                {
                    success: true,
                    message: "If the email exists, a password reset link has been sent.",
                } as AdminApiResponse,
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Password reset email sent successfully. Please check your inbox.",
            } as AdminApiResponse,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to send password reset email",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

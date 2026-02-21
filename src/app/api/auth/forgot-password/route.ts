import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/brevo";
import type { AdminApiResponse } from "@/types/admin";

const RESET_EXPIRY_MINUTES = 60;
const FRONTEND_RESET_URL = 'https://www.yatrivojourneys.com/reset-password';

// POST /api/auth/forgot-password - Generate reset token and send branded email via Brevo
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validate input
        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" } as AdminApiResponse,
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" } as AdminApiResponse,
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase();

        // Check if user exists (via public.users table)
        const { data: userProfile } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email')
            .eq('email', normalizedEmail)
            .single();

        // Always return the same generic response to prevent email enumeration
        const genericResponse = NextResponse.json(
            {
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            } as AdminApiResponse,
            { status: 200 }
        );

        if (!userProfile) {
            return genericResponse;
        }

        // Delete any existing reset tokens for this email
        await supabaseAdmin
            .from('password_resets')
            .delete()
            .eq('email', normalizedEmail);

        // Generate a secure random token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

        // Store token in DB
        const { error: insertError } = await supabaseAdmin
            .from('password_resets')
            .insert({
                email: normalizedEmail,
                token,
                expires_at: expiresAt.toISOString(),
            });

        if (insertError) {
            console.error('Password reset token insert error:', insertError);
            return NextResponse.json(
                { success: false, error: "Failed to initiate password reset. Please try again." } as AdminApiResponse,
                { status: 500 }
            );
        }

        // Build reset link pointing to front-end
        const resetLink = `${FRONTEND_RESET_URL}?token=${token}`;

        // Send branded email via Brevo
        const emailSent = await sendPasswordResetEmail({
            email: normalizedEmail,
            fullName: userProfile.full_name,
            resetLink,
        });

        if (!emailSent) {
            // Clean up token so the user can retry
            await supabaseAdmin.from('password_resets').delete().eq('token', token);
            return NextResponse.json(
                { success: false, error: "Failed to send reset email. Please try again." } as AdminApiResponse,
                { status: 500 }
            );
        }

        return genericResponse;
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to process request" } as AdminApiResponse,
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { AdminApiResponse } from "@/types/admin";

// POST /api/auth/signup - Verify OTP and create new user account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        // Validate input
        if (!email || !otp) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Email and OTP are required",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid OTP format. Must be 6 digits",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Retrieve OTP verification record
        const { data: otpRecord, error: otpFetchError } = await supabaseAdmin
            .from("otp_verifications")
            .select("*")
            .eq("email", email.toLowerCase())
            .eq("otp", otp)
            .eq("verified", false)
            .single();

        if (otpFetchError || !otpRecord) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid or expired OTP",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Check if OTP has expired
        const now = new Date();
        const expiresAt = new Date(otpRecord.expires_at);
        if (now > expiresAt) {
            // Clean up expired OTP
            await supabaseAdmin
                .from("otp_verifications")
                .delete()
                .eq("id", otpRecord.id);

            return NextResponse.json(
                {
                    success: false,
                    error: "OTP has expired. Please request a new one",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Create user with Supabase Admin
        const { data: adminAuthData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email: email.toLowerCase(),
            password: otpRecord.password_hash, // Use the stored password
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: otpRecord.full_name,
                mobile_number: otpRecord.mobile_number
            }
        });

        if (signUpError) {
            console.error("User creation error:", signUpError);
            return NextResponse.json(
                {
                    success: false,
                    error: signUpError.message || "Failed to create user account",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        const user = adminAuthData.user;

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to create user",
                } as AdminApiResponse,
                { status: 500 }
            );
        }

        // Store user profile in users table
        const { error: profileError } = await supabaseAdmin
            .from("users")
            .insert({
                id: user.id,
                full_name: otpRecord.full_name,
                mobile_number: otpRecord.mobile_number,
                email: email.toLowerCase(),
            });

        if (profileError) {
            console.error("Profile creation error:", profileError);
        }

        // Mark OTP as verified and clean up
        await supabaseAdmin
            .from("otp_verifications")
            .delete()
            .eq("id", otpRecord.id);

        return NextResponse.json(
            {
                success: true,
                data: {
                    user: {
                        uid: user.id,
                        fullName: otpRecord.full_name,
                        mobileNumber: otpRecord.mobile_number,
                        email: email.toLowerCase(),
                        createdAt: new Date(user.created_at),
                        updatedAt: new Date(),
                    },
                    message: "Account created successfully. Please login to continue.",
                },
                message: "User registered and verified successfully",
            } as AdminApiResponse,
            { status: 201 }
        );
    } catch (error: any) {
        console.error("SignUp error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Registration failed",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

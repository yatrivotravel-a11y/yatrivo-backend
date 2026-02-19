import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateOTP, sendOTPEmail } from "@/lib/brevo";
import type { AdminApiResponse } from "@/types/admin";

// POST /api/auth/request-otp - Request OTP for signup
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fullName, mobileNumber, email, password } = body;

        // Validate input
        if (!fullName || !mobileNumber || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "All fields are required: fullName, mobileNumber, email, password",
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

        // Validate mobile number format (basic validation)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobileNumber)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid mobile number. Must be 10 digits",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password must be at least 6 characters long",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = existingUsers?.users.some(u => u.email === email.toLowerCase());
        
        if (userExists) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User with this email already exists",
                } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Delete any existing OTP for this email
        await supabaseAdmin
            .from("otp_verifications")
            .delete()
            .eq("email", email.toLowerCase());

        // Store OTP in database with plain password (temporary, will be deleted after verification)
        const { error: otpError } = await supabaseAdmin
            .from("otp_verifications")
            .insert({
                email: email.toLowerCase(),
                otp,
                full_name: fullName.trim(),
                mobile_number: mobileNumber,
                password_hash: password, // Store password temporarily (will be hashed by Supabase on user creation)
                expires_at: expiresAt.toISOString(),
                verified: false,
            });

        if (otpError) {
            console.error("OTP storage error:", otpError);
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to generate OTP. Please try again.",
                } as AdminApiResponse,
                { status: 500 }
            );
        }

        // Send OTP via email
        const emailSent = await sendOTPEmail({
            email: email.toLowerCase(),
            fullName: fullName.trim(),
            otp,
        });

        if (!emailSent) {
            await supabaseAdmin
                .from("otp_verifications")
                .delete()
                .eq("email", email.toLowerCase())
                .eq("otp", otp);

            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to send OTP email. Please try again.",
                } as AdminApiResponse,
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "OTP sent successfully to your email. Please verify within 10 minutes.",
                data: {
                    email: email.toLowerCase(),
                    expiresAt: expiresAt.toISOString(),
                },
            } as AdminApiResponse,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Request OTP error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to process OTP request",
            } as AdminApiResponse,
            { status: 500 }
        );
    }
}

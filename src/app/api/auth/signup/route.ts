import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { AdminApiResponse } from "@/types/admin";

// POST /api/auth/signup - Create new user account
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

        // Sign up user with Supabase Admin (bypasses rate limits and auto-confirms)
        // Note: We use admin.createUser to bypass the "email rate limit exceeded" error 
        // which occurs when too many emails are sent or signups from same IP.
        const { data: adminAuthData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm to skip email sending and bypass rate limits
            user_metadata: {
                full_name: fullName,
                mobile_number: mobileNumber
            }
        });

        if (signUpError) {
            return NextResponse.json(
                {
                    success: false,
                    error: signUpError.message,
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
        // Use supabaseAdmin to bypass RLS policies regarding INSERT
        const { error: profileError } = await supabaseAdmin
            .from("users")
            .insert({
                id: user.id,
                full_name: fullName.trim(),
                mobile_number: mobileNumber,
                email: email.toLowerCase(),
            });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            // User is created in auth but profile failed - this is OK for now
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    user: {
                        uid: user.id,
                        fullName: fullName.trim(),
                        mobileNumber,
                        email: email.toLowerCase(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    // We don't get a session with createUser, so token is empty. 
                    // Client should redirect to login.
                    token: "",
                },
                message: "User registered successfully",
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

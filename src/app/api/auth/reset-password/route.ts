import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { AdminApiResponse } from "@/types/admin";

// POST /api/auth/reset-password - Validate token and update user password
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, newPassword } = body;

        if (!token || !newPassword) {
            return NextResponse.json(
                { success: false, error: "Token and new password are required" } as AdminApiResponse,
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 6 characters long" } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Look up the token
        const { data: resetRecord, error: tokenError } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('token', token)
            .single();

        if (tokenError || !resetRecord) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired reset link. Please request a new one." } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Check expiry
        if (new Date() > new Date(resetRecord.expires_at)) {
            await supabaseAdmin.from('password_resets').delete().eq('token', token);
            return NextResponse.json(
                { success: false, error: "This reset link has expired. Please request a new one." } as AdminApiResponse,
                { status: 400 }
            );
        }

        // Find the auth user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            console.error('List users error:', listError);
            return NextResponse.json(
                { success: false, error: "Failed to process request. Please try again." } as AdminApiResponse,
                { status: 500 }
            );
        }

        const authUser = users.find(u => u.email?.toLowerCase() === resetRecord.email.toLowerCase());

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "No account found for this email." } as AdminApiResponse,
                { status: 404 }
            );
        }

        // Update the password via Supabase admin
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            authUser.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json(
                { success: false, error: updateError.message || "Failed to update password. Please try again." } as AdminApiResponse,
                { status: 500 }
            );
        }

        // Delete the used token
        await supabaseAdmin.from('password_resets').delete().eq('token', token);

        return NextResponse.json(
            {
                success: true,
                message: "Password updated successfully. You can now log in with your new password.",
            } as AdminApiResponse,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to reset password" } as AdminApiResponse,
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE /api/auth/delete - Delete user account
export async function DELETE(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized. Please provide a valid token",
                },
                { status: 401 }
            );
        }

        const token = authHeader.split("Bearer ")[1];

        // Get user from token
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { uid } = body;

        if (!uid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User ID is required",
                },
                { status: 400 }
            );
        }

        // Verify that the user is deleting their own account
        if (user.id !== uid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized. You can only delete your own account",
                },
                { status: 403 }
            );
        }

        // Delete user profile from users table (will cascade due to foreign key)
        const { error: profileError } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", uid);

        if (profileError) {
            console.error("Profile deletion error:", profileError);
        }

        // Delete user from Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);

        if (deleteError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to delete user account",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "User account deleted successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to delete user account",
            },
            { status: 500 }
        );
    }
}

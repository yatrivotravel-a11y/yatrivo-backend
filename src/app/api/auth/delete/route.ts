import { NextRequest, NextResponse } from "next/server";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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

        // Note: In a real-world scenario, you would verify the token here
        // For Firebase, the client should be authenticated and send the user's UID

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

        // Get the current user from Firebase Auth
        const currentUser = auth.currentUser;

        if (!currentUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No authenticated user found",
                },
                { status: 401 }
            );
        }

        // Verify that the user is deleting their own account
        if (currentUser.uid !== uid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized. You can only delete your own account",
                },
                { status: 403 }
            );
        }

        // Delete user document from Firestore
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);

        // Delete user from Firebase Authentication
        await deleteUser(currentUser);

        return NextResponse.json(
            {
                success: true,
                message: "User account deleted successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Delete user error:", error);

        // Handle Firebase specific errors
        let errorMessage = "Failed to delete user account";
        let statusCode = 500;

        if (error.code === "auth/requires-recent-login") {
            errorMessage = "This operation requires recent authentication. Please login again";
            statusCode = 401;
        } else if (error.code === "auth/user-not-found") {
            errorMessage = "User not found";
            statusCode = 404;
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
            },
            { status: statusCode }
        );
    }
}

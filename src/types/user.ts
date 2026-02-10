// User types for authentication and Firestore

export interface UserProfile {
    uid: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SignUpRequest {
    fullName: string;
    mobileNumber: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface DeleteUserRequest {
    uid: string;
    token: string;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        user: UserProfile;
        token: string;
    };
    message?: string;
    error?: string;
}

export interface PasswordResetResponse {
    success: boolean;
    message?: string;
    error?: string;
}

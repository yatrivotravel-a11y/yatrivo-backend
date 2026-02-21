// Brevo (formerly Sendinblue) email service configuration

import { BrevoClient } from '@getbrevo/brevo';

// Validate required environment variables at module load
const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL; // Must be a verified Brevo sender — no fallback
const senderName = process.env.BREVO_SENDER_NAME || 'Yatrivo';
const adminEmail = 'info@yatrivojourneys.com';

if (!apiKey) {
    console.error('❌ [Brevo] BREVO_API_KEY is not set in environment variables!');
}
if (!senderEmail) {
    console.error('❌ [Brevo] BREVO_SENDER_EMAIL is not set in environment variables! Emails will NOT be sent.');
}
if (apiKey && senderEmail) {
    console.log(`✅ [Brevo] Ready — sender: ${senderName} <${senderEmail}>`);
}

const brevo = new BrevoClient({
    apiKey: apiKey || '',
});

export interface SendOTPEmailParams {
    email: string;
    fullName: string;
    otp: string;
}

/**
 * Send OTP email using Brevo
 */
export async function sendOTPEmail({ email, fullName, otp }: SendOTPEmailParams): Promise<boolean> {
    try {
        if (!apiKey) {
            console.error('❌ Cannot send OTP email: BREVO_API_KEY is missing.');
            return false;
        }

        if (!senderEmail) {
            console.error('❌ [Brevo] Cannot send OTP email: BREVO_SENDER_EMAIL environment variable is not set.');
            return false;
        }

        if (senderEmail.includes('example.com') || senderEmail === 'your-verified-email@example.com') {
            console.error('❌ [Brevo] Cannot send OTP email: BREVO_SENDER_EMAIL is still a placeholder value:', senderEmail);
            return false;
        }

        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Verify Your Yatrivo Account - OTP",
            to: [{ email, name: fullName }],
            sender: { name: senderName, email: senderEmail! },
            textContent: `Hello ${fullName}, your Yatrivo OTP is ${otp}. It is valid for 10 minutes.`,
            htmlContent: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Verify Your Yatrivo Account</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                                    <!-- Header -->
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#F97316 0%,#ea6a00 100%);padding:36px 40px 28px;text-align:center;">
                                            <!-- Logo -->
                                            <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                                                <tr>
                                                    <td style="vertical-align:middle;">
                                                        <span style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;">YATRI</span><span style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;">V</span><span style="font-size:32px;color:#2DD4BF;font-weight:900;">✈</span><span style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;">O</span>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin:0;color:rgba(255,255,255,0.90);font-size:14px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">Premium Travel Experiences</p>
                                        </td>
                                    </tr>

                                    <!-- Orange accent bar -->
                                    <tr>
                                        <td style="background-color:#2DD4BF;height:4px;"></td>
                                    </tr>

                                    <!-- Body -->
                                    <tr>
                                        <td style="padding:40px 48px 32px;">
                                            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">Verify Your Account</h2>
                                            <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">Hello <strong style="color:#1e293b;">${fullName}</strong>, thank you for joining Yatrivo! Use the OTP below to complete your registration.</p>

                                            <!-- OTP Box -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                                <tr>
                                                    <td align="center">
                                                        <table cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fff7ed 0%,#fff 100%);border:2px solid #F97316;border-radius:14px;padding:28px 48px;text-align:center;">
                                                            <tr>
                                                                <td>
                                                                    <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#F97316;font-weight:600;">Your One-Time Password</p>
                                                                    <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:14px;color:#1e293b;font-family:'Courier New',monospace;">${otp}</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Timer badge -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                                <tr>
                                                    <td align="center">
                                                        <span style="display:inline-block;background-color:#f0fdf4;border:1px solid #86efac;border-radius:99px;padding:8px 20px;font-size:13px;color:#16a34a;font-weight:600;">⏱ Valid for 10 minutes only</span>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Divider -->
                                            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />

                                            <!-- Steps -->
                                            <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#1e293b;">How to use this OTP:</p>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                                <tr>
                                                    <td style="padding:8px 0;">
                                                        <table cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width:28px;height:28px;background-color:#F97316;border-radius:50%;text-align:center;vertical-align:middle;">
                                                                    <span style="color:#fff;font-size:13px;font-weight:700;">1</span>
                                                                </td>
                                                                <td style="padding-left:12px;font-size:14px;color:#475569;">Go back to the Yatrivo signup page</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 0;">
                                                        <table cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width:28px;height:28px;background-color:#F97316;border-radius:50%;text-align:center;vertical-align:middle;">
                                                                    <span style="color:#fff;font-size:13px;font-weight:700;">2</span>
                                                                </td>
                                                                <td style="padding-left:12px;font-size:14px;color:#475569;">Enter the 6-digit OTP shown above</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 0;">
                                                        <table cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width:28px;height:28px;background-color:#F97316;border-radius:50%;text-align:center;vertical-align:middle;">
                                                                    <span style="color:#fff;font-size:13px;font-weight:700;">3</span>
                                                                </td>
                                                                <td style="padding-left:12px;font-size:14px;color:#475569;">Start exploring premium travel experiences!</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Security warning -->
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="background-color:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 16px;">
                                                        <p style="margin:0;font-size:13px;color:#b91c1c;font-weight:500;">🔒 Never share this OTP with anyone. Yatrivo will never ask for your OTP.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Destinations strip -->
                                    <tr>
                                        <td style="background-color:#f8fafc;padding:20px 48px;border-top:1px solid #e2e8f0;">
                                            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Popular Destinations</p>
                                            <table cellpadding="0" cellspacing="0">
                                                <tr>
                                                    ${['Kashmir','Goa','Kerala','Rajasthan','Ladakh'].map(d =>
                                                        `<td style="padding-right:8px;"><span style="display:inline-block;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:99px;padding:5px 14px;font-size:12px;color:#475569;font-weight:500;">${d}</span></td>`
                                                    ).join('')}
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color:#1e293b;padding:24px 48px;text-align:center;">
                                            <p style="margin:0 0 6px;font-size:18px;font-weight:900;color:#F97316;letter-spacing:2px;">YATRIVO</p>
                                            <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;">Discover the Soul of India</p>
                                            <p style="margin:0;font-size:11px;color:#64748b;">&copy; 2026 Yatrivo. All rights reserved. &nbsp;|&nbsp; If you didn't request this, please ignore this email.</p>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        });

        const messageIdentifier = result?.messageId || result?.messageIds?.[0];
        if (!messageIdentifier) {
            console.error('❌ Brevo accepted request but no messageId was returned:', result);
            return false;
        }

        console.log('✅ OTP email accepted by Brevo. messageId:', messageIdentifier);
        return true;
    } catch (error: any) {
        const statusCode = error?.statusCode || error?.status || error?.response?.status;
        const errorBody = error?.body || error?.response?.data || error?.message;
        console.error('❌ Brevo email send error:', { statusCode, error: errorBody });
        return false;
    }
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface SendBookingNotificationParams {
    bookingId: string;
    customerName: string;
    customerEmail: string;
    customerMobile: string;
    packageName: string;
    packageCity: string;
    packagePriceRange: string;
    totalAmount: number;
    bookingDate: string;
}

/**
 * Send booking notification email to admin (info@yatrivojourneys.com)
 */
export async function sendBookingNotificationEmail(params: SendBookingNotificationParams): Promise<boolean> {
    const {
        bookingId,
        customerName,
        customerEmail,
        customerMobile,
        packageName,
        packageCity,
        packagePriceRange,
        totalAmount,
        bookingDate,
    } = params;

    try {
        if (!apiKey) {
            console.error('❌ [Brevo] Cannot send booking notification: BREVO_API_KEY is missing.');
            return false;
        }

        if (!senderEmail) {
            console.error('❌ [Brevo] Cannot send booking notification: BREVO_SENDER_EMAIL is not set.');
            return false;
        }

        const formattedDate = new Date(bookingDate).toLocaleString('en-IN', {
            dateStyle: 'long',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
        });

        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(totalAmount);

        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: `🧳 New Booking Alert — ${packageName} by ${customerName}`,
            to: [{ email: adminEmail, name: 'Yatrivo Admin' }],
            sender: { name: senderName, email: senderEmail! },
            textContent: `New booking received!\n\nBooking ID: ${bookingId}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerMobile}\nPackage: ${packageName}, ${packageCity}\nAmount: ${formattedAmount}\nDate: ${formattedDate}`,
            htmlContent: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>New Booking Alert</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                                    <!-- Header -->
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#F97316 0%,#ea6a00 100%);padding:32px 40px 24px;text-align:center;">
                                            <table cellpadding="0" cellspacing="0" style="margin:0 auto 10px;">
                                                <tr>
                                                    <td>
                                                        <span style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:2px;">YATRI</span><span style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:2px;">V</span><span style="font-size:28px;color:#2DD4BF;font-weight:900;">✈</span><span style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:2px;">O</span>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin:0;color:rgba(255,255,255,0.90);font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">Admin Booking Notification</p>
                                        </td>
                                    </tr>

                                    <!-- Teal accent bar -->
                                    <tr>
                                        <td style="background-color:#2DD4BF;height:4px;"></td>
                                    </tr>

                                    <!-- Alert badge -->
                                    <tr>
                                        <td style="padding:28px 48px 0;text-align:center;">
                                            <span style="display:inline-block;background-color:#fff7ed;border:1.5px solid #F97316;border-radius:99px;padding:8px 24px;font-size:13px;color:#c2410c;font-weight:700;letter-spacing:0.5px;">🧳 New Booking Received</span>
                                        </td>
                                    </tr>

                                    <!-- Body -->
                                    <tr>
                                        <td style="padding:24px 48px 32px;">
                                            <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">A new tour booking has been placed. Here are the full details:</p>

                                            <!-- Package Card -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fff7ed,#fff);border:2px solid #F97316;border-radius:12px;margin-bottom:24px;overflow:hidden;">
                                                <tr>
                                                    <td style="background-color:#F97316;padding:10px 20px;">
                                                        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#fff;font-weight:700;">Package Details</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:20px;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="padding:6px 0;font-size:14px;color:#64748b;width:140px;">Package Name</td>
                                                                <td style="padding:6px 0;font-size:14px;font-weight:700;color:#1e293b;">${packageName}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:6px 0;font-size:14px;color:#64748b;">City / Destination</td>
                                                                <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;">${packageCity}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:6px 0;font-size:14px;color:#64748b;">Price Range</td>
                                                                <td style="padding:6px 0;font-size:14px;color:#1e293b;">${packagePriceRange}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:6px 0;font-size:14px;color:#64748b;">Amount Charged</td>
                                                                <td style="padding:6px 0;font-size:16px;font-weight:900;color:#F97316;">${formattedAmount}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Customer Card -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;margin-bottom:24px;overflow:hidden;">
                                                <tr>
                                                    <td style="background-color:#1e293b;padding:10px 20px;">
                                                        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:700;">Customer Information</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:20px;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="padding:6px 0;font-size:14px;color:#64748b;width:140px;">Full Name</td>
                                                                <td style="padding:6px 0;font-size:14px;font-weight:700;color:#1e293b;">${customerName}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:6px 0;font-size:14px;color:#64748b;">Email Address</td>
                                                                <td style="padding:6px 0;"><a href="mailto:${customerEmail}" style="font-size:14px;color:#F97316;font-weight:600;text-decoration:none;">${customerEmail}</a></td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:6px 0;font-size:14px;color:#64748b;">Mobile Number</td>
                                                                <td style="padding:6px 0;"><a href="tel:${customerMobile}" style="font-size:14px;color:#F97316;font-weight:600;text-decoration:none;">+91 ${customerMobile}</a></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Booking meta -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                                <tr>
                                                    <td style="padding:0 0 8px;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="font-size:13px;color:#64748b;">Booking ID</td>
                                                                <td style="font-size:13px;color:#94a3b8;text-align:right;font-family:'Courier New',monospace;">#${bookingId.slice(0, 8).toUpperCase()}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="font-size:13px;color:#64748b;">Booked On</td>
                                                                <td style="font-size:13px;color:#94a3b8;text-align:right;">${formattedDate}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- CTA -->
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="background-color:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:14px 16px;">
                                                        <p style="margin:0;font-size:13px;color:#15803d;font-weight:500;">📞 Please contact the customer at <strong>${customerMobile}</strong> or <strong>${customerEmail}</strong> to confirm the booking.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color:#1e293b;padding:24px 48px;text-align:center;">
                                            <p style="margin:0 0 6px;font-size:18px;font-weight:900;color:#F97316;letter-spacing:2px;">YATRIVO</p>
                                            <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;">Discover the Soul of India</p>
                                            <p style="margin:0;font-size:11px;color:#64748b;">This is an automated notification sent to the Yatrivo admin team.</p>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        });

        const messageIdentifier = result?.messageId || result?.messageIds?.[0];
        if (!messageIdentifier) {
            console.error('❌ [Brevo] Booking notification accepted but no messageId returned:', result);
            return false;
        }

        console.log(`✅ [Brevo] Booking notification sent to admin. messageId: ${messageIdentifier}`);
        return true;
    } catch (error: any) {
        const statusCode = error?.statusCode || error?.status || error?.response?.status;
        const errorBody = error?.body || error?.response?.data || error?.message;
        console.error('❌ [Brevo] Booking notification send error:', { statusCode, error: errorBody });
        return false;
    }
}

export interface SendPasswordResetEmailParams {
    email: string;
    fullName: string;
    resetLink: string;
}

/**
 * Send password reset email via Brevo with a branded template
 */
export async function sendPasswordResetEmail({ email, fullName, resetLink }: SendPasswordResetEmailParams): Promise<boolean> {
    try {
        if (!apiKey) {
            console.error('❌ [Brevo] Cannot send password reset email: BREVO_API_KEY is missing.');
            return false;
        }

        if (!senderEmail) {
            console.error('❌ [Brevo] Cannot send password reset email: BREVO_SENDER_EMAIL is not set.');
            return false;
        }

        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: 'Reset Your Yatrivo Password',
            to: [{ email, name: fullName }],
            sender: { name: senderName, email: senderEmail! },
            textContent: `Hello ${fullName},\n\nYou requested a password reset for your Yatrivo account.\n\nClick the link below to set a new password (valid for 1 hour):\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nThe Yatrivo Team`,
            htmlContent: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Reset Your Yatrivo Password</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                                    <!-- Header -->
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#F97316 0%,#ea6a00 100%);padding:36px 40px 28px;text-align:center;">
                                            <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                                                <tr>
                                                    <td>
                                                        <span style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;">YATRI</span><span style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;">V</span><span style="font-size:32px;color:#2DD4BF;font-weight:900;">✈</span><span style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;">O</span>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin:0;color:rgba(255,255,255,0.90);font-size:14px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">Premium Travel Experiences</p>
                                        </td>
                                    </tr>

                                    <!-- Teal accent bar -->
                                    <tr>
                                        <td style="background-color:#2DD4BF;height:4px;"></td>
                                    </tr>

                                    <!-- Body -->
                                    <tr>
                                        <td style="padding:40px 48px 32px;">

                                            <!-- Lock icon badge -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                                <tr>
                                                    <td align="center">
                                                        <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#fff7ed,#fff);border:2px solid #F97316;border-radius:50%;text-align:center;line-height:64px;font-size:28px;">🔐</div>
                                                    </td>
                                                </tr>
                                            </table>

                                            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;text-align:center;">Reset Your Password</h2>
                                            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;text-align:center;">Hello <strong style="color:#1e293b;">${fullName}</strong>, we received a request to reset the password for your Yatrivo account. Click the button below to choose a new password.</p>

                                            <!-- CTA Button -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#F97316 0%,#ea6a00 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.5px;">Reset My Password →</a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Expiry badge -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                                <tr>
                                                    <td align="center">
                                                        <span style="display:inline-block;background-color:#fef9c3;border:1px solid #fde047;border-radius:99px;padding:8px 20px;font-size:13px;color:#854d0e;font-weight:600;">⏱ This link expires in 1 hour</span>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Divider -->
                                            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;" />

                                            <!-- Fallback link -->
                                            <p style="margin:0 0 8px;font-size:13px;color:#64748b;">If the button above doesn't work, copy and paste this link into your browser:</p>
                                            <p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="${resetLink}" style="color:#F97316;text-decoration:none;">${resetLink}</a></p>

                                            <!-- Security warning -->
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="background-color:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 16px;">
                                                        <p style="margin:0;font-size:13px;color:#b91c1c;font-weight:500;">🔒 If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color:#1e293b;padding:24px 48px;text-align:center;">
                                            <p style="margin:0 0 6px;font-size:18px;font-weight:900;color:#F97316;letter-spacing:2px;">YATRIVO</p>
                                            <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;">Discover the Soul of India</p>
                                            <p style="margin:0;font-size:11px;color:#64748b;">&copy; 2026 Yatrivo. All rights reserved.</p>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        });

        const messageIdentifier = result?.messageId || result?.messageIds?.[0];
        if (!messageIdentifier) {
            console.error('❌ [Brevo] Password reset email accepted but no messageId returned:', result);
            return false;
        }

        console.log(`✅ [Brevo] Password reset email sent to ${email}. messageId: ${messageIdentifier}`);
        return true;
    } catch (error: any) {
        const statusCode = error?.statusCode || error?.status || error?.response?.status;
        const errorBody = error?.body || error?.response?.data || error?.message;
        console.error('❌ [Brevo] Password reset email send error:', { statusCode, error: errorBody });
        return false;
    }
}

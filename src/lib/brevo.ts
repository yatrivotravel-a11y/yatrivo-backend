// Brevo (formerly Sendinblue) email service configuration

import { BrevoClient } from '@getbrevo/brevo';

// Debug: Check if API key is loaded
const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@yatrivo.com';
const senderName = process.env.BREVO_SENDER_NAME || 'Yatrivo';

if (!apiKey) {
    console.error('❌ BREVO_API_KEY is not set in environment variables!');
} else {
    console.log('✅ Sender configured:', senderName, '<' + senderEmail + '>');
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

        if (
            !senderEmail ||
            senderEmail.includes('example.com') ||
            senderEmail === 'noreply@yatrivo.com' ||
            senderEmail === 'your-verified-email@example.com'
        ) {
            console.error('❌ Cannot send OTP email: BREVO_SENDER_EMAIL is not configured with a verified Brevo sender.');
            return false;
        }

        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Verify Your Yatrivo Account - OTP",
            to: [{ email, name: fullName }],
            sender: { name: senderName, email: senderEmail },
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

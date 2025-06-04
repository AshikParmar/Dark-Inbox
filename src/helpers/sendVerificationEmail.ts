import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";


export async function sendVerificationEmail(email: string, username: string, verifyCode: string)
: Promise<ApiResponse>{
    try {
        const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Dark Inbox | Verification Code',
        react: VerificationEmail( {username, otp: verifyCode} ),
        });

        if (error) {
            return { 
                success: false,
                message: error.message,
            }
        }

        return {
            success: true,
            message: "Verification email send successfully."
        }
    } catch (emailError) {
        console.log("Error sending verification Email.", emailError);
        return {
            success: false,
            message: "Failed to send verification email."
        }
    }
}
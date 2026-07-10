"use server"
import {Resend} from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
export default async function sendEmail({email, token}){
    try{

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to:email,
          subject: "Verify your email",
          html: `
            <p>Verify your account</p>
            <a href="${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}">
              Verify Email
            </a>
          `
        })
    } catch{
        throw new Error("Email Not sent.")
    }
}
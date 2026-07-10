import connectMongo from '@/lib/dbConfig';
import { User } from '@/models/User';
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      // Redirect to login with an error param
      const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${base}/login?error=missing_token`)
    }

    await connectMongo();

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${base}/login?error=invalid_or_expired_token`)
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    // Redirect to /login with verified=true so the login page shows a success message
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${base}/login?verified=true`)
  } catch (error) {
    console.error("Verification error:", error);
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${base}/login?error=server_error`)
  }
}

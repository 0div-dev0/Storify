import connectMongo from '@/lib/dbConfig';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs'
import { NextResponse } from "next/server"
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    await connectMongo()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If user exists but is not verified, we can allow re-creation or just resend email
        // For simplicity, let's delete the unverified user and create fresh
        await User.findByIdAndDelete(existingUser._id);
      } else {
        return NextResponse.json({ error: "User already exists" }, { status: 400 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const token = crypto.randomBytes(32).toString("hex")
    
    const newUser = await User.create({ 
      email, 
      password: hashedPassword, 
      isVerified: false, 
      verifyToken: token, 
      verifyTokenExpiry: Date.now() + 1000 * 60 * 60 // 1 hour
    })

    return NextResponse.json(
      {
        message: "User created. Please verify your email.",
        user: { id: newUser._id, email: newUser.email, token: newUser.verifyToken }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong during signup" }, { status: 500 })
  }
}
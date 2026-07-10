import NextAuth from 'next-auth'
import GithubProvider from "next-auth/providers/github"
import connectMongo from '@/lib/dbConfig'
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs'
import { User } from '@/models/User'

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectMongo()
        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          throw new Error('No account found with this email')
        }

        if (!user.isVerified) {
          throw new Error('Verify Email first')
        }
//         if (!user.email) {
//   throw new Error("GitHub account has no email")
// }

        if (!user.password) {
          // GitHub OAuth user trying to use credentials
          throw new Error('This account uses GitHub login. Please sign in with GitHub.')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return { id: user._id.toString(), email: user.email, name: user.name }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',  // NextAuth error page redirects to /login?error=...
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      // For GitHub OAuth: auto-create or update user in DB
      if (account?.provider === 'github') {
        try {
          await connectMongo()
          const existing = await User.findOne({ email: user.email })
          if (!existing) {
            await User.create({
              email: user.email,
              password: 'OAUTH_NO_PASSWORD', // placeholder — not used for OAuth       set null
              isVerified: true,
            })
          }
        } catch (error) {
          console.error('GitHub sign-in DB error:', error)
          return false
        }
      }
      return true
    },
async jwt({ token, user, trigger }) {
  await connectMongo()

  // On initial login
  if (user?.email) {
    const dbUser = await User.findOne({ email: user.email })

    if (!dbUser) {
      throw new Error("User not found in DB")
    }

    token.id = dbUser._id.toString()
    token.email = dbUser.email
  }

  // On subsequent requests, validate user still exists in DB
  if (!user && token?.email) {
    const dbUser = await User.findOne({ email: token.email })
    if (!dbUser) {
      throw new Error("User not found in DB")
    }
    token.id = dbUser._id.toString()
    token.email = dbUser.email
  }

  return token
},
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
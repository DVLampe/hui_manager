// src/app/api/auth/[...nextauth]/route.js
import NextAuthOriginal from "next-auth" // Import with a different name
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import bcrypt from "bcrypt"

// Apply the workaround pattern to NextAuth itself
const NextAuth = NextAuthOriginal.default || NextAuthOriginal;

console.log('[NextAuth] Loading route.js...');
// ... (other console.logs)

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    (GoogleProvider.default || GoogleProvider)({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    (EmailProvider.default || EmailProvider)({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    {
      id: "zalo",
      name: "Zalo",
      type: "oauth",
      authorization: "https://oauth.zaloapp.com/v4/permission?prompt=consent",
      token: "https://oauth.zaloapp.com/v4/access_token",
      userinfo: {
        url: "https://graph.zalo.me/v2.0/me",
        params: { fields: "id,name,picture" },
        async request(context) {
          const { tokens, provider } = context;
          const url = new URL(provider.userinfo.url);
          url.searchParams.set("access_token", tokens.access_token);
          if (provider.userinfo.params) {
            Object.entries(provider.userinfo.params).forEach(([key, value]) =>
              url.searchParams.set(key, value)
            );
          }
          const res = await fetch(url);
          return await res.json();
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          // Zalo API does not provide email, NextAuth will ask the user to provide one
          // if the account is new.
          email: null, 
          image: profile.picture?.data?.url,
        };
      },
      clientId: process.env.ZALO_CLIENT_ID,
      clientSecret: process.env.ZALO_CLIENT_SECRET,
      checks: ["pkce", "state"],
    },
    (CredentialsProvider.default || CredentialsProvider)({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[NextAuth] Authorize function called for email:', credentials?.email);
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });

        // Also check for user.password to allow social-only accounts
        if (!user || !user.password) return null;

        // Check if the user account is active
        if (!user.isActive) {
          console.log('[NextAuth] Authorization failed: User account is inactive for:', user.email);
          // Throw an error with a specific message that can be caught on the client
          throw new Error("Tài khoản của bạn đã bị khóa.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        console.log('[NextAuth] Authorization successful for:', user.email);
        // Return the full user object to be used in the JWT callback
        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isActive: true },
        });
        if (dbUser && !dbUser.isActive) {
          // Redirect to a specific error page or show a message
          return '/signin?error=AccountLocked';
        }
      }
      // Allow sign-in
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Add other user properties you want in the token
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }

      // This trigger is called when the user updates their session using the `update` function
      if (trigger === "update" && session) {
        console.log('[NextAuth] JWT update triggered, session:', session);
        token.name = session.user.name;
        token.image = session.user.image;
        // You can add other fields to update here if needed
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
         const user = await prisma.user.findUnique({
            where: { id: token.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                phone: true,
                dateOfBirth: true,
                about: true,
                createdAt: true,
                bankName: true,
                bankAccountNumber: true,
                bankAccountName: true,
                qrCodeUrl: true,
            }
        });

        if (user) {
            session.user = user;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

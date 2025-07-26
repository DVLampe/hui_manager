// src/app/api/auth/[...nextauth]/route.js
import NextAuthOriginal from "next-auth" // Import with a different name
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

// Apply the workaround pattern to NextAuth itself
const NextAuth = NextAuthOriginal.default || NextAuthOriginal;

console.log('[NextAuth] Loading route.js...');
// ... (other console.logs)

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
        if (!user) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;
        console.log('[NextAuth] Authorization successful for:', user.email);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  // ... (rest of the config remains the same)
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // console.log('[NextAuth] Inside JWT callback'); // Lowering log noise
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // console.log('[NextAuth] Inside Session callback'); // Lowering log noise
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
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
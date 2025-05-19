import NextAuth from "next-auth/next"
import prisma from "../../../../lib/prisma"
import { compare } from "bcryptjs"

const CredentialsProvider = {
  id: "credentials",
  name: "Credentials",
  type: "credentials",
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    try {
      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username: credentials.username }
      });
      
      // If user not found or password doesn't match
      if (!user || !(await compare(credentials.password, user.hashedPassword))) {
        return null;
      }
      
      // Return user object (without password)
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      };
    } catch (error) {
      console.error("Error in authorize function:", error);
      return null;
    }
  }
};

export const authOptions = {
  providers: [
    CredentialsProvider
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
};

// Handle potential differences in NextAuth export structure
let NextAuthToUse = NextAuth;
if (typeof NextAuth !== 'function' && NextAuth.default && typeof NextAuth.default === 'function') {
  NextAuthToUse = NextAuth.default;
}

if (typeof NextAuthToUse !== 'function') {
  console.error('CRITICAL: NextAuthToUse is NOT a function!');
  throw new Error('NextAuth initialization failed: NextAuthToUse is not a function');
}

const handler = NextAuthToUse(authOptions);
export { handler as GET, handler as POST };

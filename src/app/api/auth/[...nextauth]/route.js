import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials" // default import!
import prisma from "../../../../lib/prisma"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // ...ваша логика авторизации...
        return null
      }
    })
  ]
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

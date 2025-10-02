import NextAuth from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaDb";

const extendedAuthOptions: NextAuthOptions = {
  ...authOptions,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            id: true,
            email: true,
            onboardingCompleted: true,
            role: true,
          }
        });

        if (!dbUser?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dbUser.email)) {
          return {
            ...token,
            emailError: "Invalid email"
          };
        }

        return {
          ...token,
          id: dbUser.id,
          email: dbUser.email,
          onboardingCompleted: dbUser.onboardingCompleted,
          role: dbUser.role
        };
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT & { emailError?: string } }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          onboardingCompleted: token.onboardingCompleted as boolean,
          role: token.role as string,
          emailError: token.emailError
        }
      };
    }
  }
};

const handler = NextAuth(extendedAuthOptions);
export { handler as GET, handler as POST };
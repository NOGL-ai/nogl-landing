import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Initialize NextAuth handler with the base auth options
// All customizations should be done in @/lib/auth.ts
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

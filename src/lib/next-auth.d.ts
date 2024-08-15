import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      role?: string; // Add the role here
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string; // Add the role here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string; // Add the role here
  }
}

import { Environments, Pages, Routes } from "@/constants/enums";
import { DefaultSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import { Locale } from "@/i18n.config";
import { User, UserRole } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { login } from "./_actions/auth";


declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Partial<User> {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NETAUTH_SECRET,
  debug: process.env.NODE_ENV === Environments.DEV,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        const currentUrl = req?.headers?.referer;
        const locale = currentUrl?.split("/")[3] as Locale;

        // 🔹 1. Validate inputs first
        if (!credentials?.email || !credentials?.password) {
          return null; // Return null instead of throwing error
        }

        // 🔹 2. Run your custom login
        const res = await login(credentials, locale);

        // 🔹 3. Handle login result
        if (res.status === 200 && res) {
          return {
            id: res.id,
            email: res.email,
            name: res.name,
            role: res.role,
          };
        } else {
          // Return null for failed authentication
          return null;
        }
      }
    }),
  ],
  adapter: PrismaAdapter(db),
  pages: {
    signIn: `/${Routes.AUTH}/${Pages.LOGIN}`,
    error: `/${Routes.AUTH}/${Pages.LOGIN}`, // Add error page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
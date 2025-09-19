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
  secret: process.env.next-auth_SECRET,
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
    throw new Error(
      JSON.stringify({
        validationError: {
          email: !credentials?.email ? "Email is required" : undefined,
          password: !credentials?.password ? "Password is required" : undefined,
        },
      })
    );
  }

  // 🔹 2. Run your custom login
  const res = await login(credentials, locale);

  // 🔹 3. Handle login result
  if (res.status === 200 && res.user) {
    return res.user;
  } else {
    throw new Error(
      JSON.stringify({
        validationError: res.error, // field-specific errors (if you send them)
        responseError: res.message, // global error
      })
    );
  }
}

    }),
  ],
  adapter: PrismaAdapter(db),
  pages: {
    signIn: `/${Routes.AUTH}/${Pages.LOGIN}`,
  },
};

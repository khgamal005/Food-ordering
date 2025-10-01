import { Environments, Pages, Routes } from "@/constants/enums";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { login } from "./_actions/auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { JWT } from "next-auth/jwt";
import { User } from "@prisma/client";
import { Locale } from "@/i18n.config";

// -------------------
// 🔹 Module Augmentation
// -------------------
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Partial<User> {
    id: string;
    role: string; // or replace 'string' with the actual type if you have a union type for roles
  }
}

// -------------------
// 🔹 Auth Config
// -------------------
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const currentUrl = req?.headers?.referer;
        const locale = currentUrl?.split("/")[3] as Locale;
        const res = await login(credentials, locale);

        if (res.status === 200 && res.user) {
          return res.user;
        }
        throw new Error(
          JSON.stringify({
            validationError: res.error,
            responseError: res.message,
          })
        );
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,  // 24 hours
  },

  callbacks: {
    // 🔹 Runs whenever a JWT is created/updated
    async jwt({ token }): Promise<JWT> {
      const dbUser = await db.user.findUnique({
        where: { email: token.email! },
      });

      if (!dbUser) return token;

      return {
        ...token,
        id: dbUser.id,
        role: dbUser.role,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        phone: dbUser.phone,
        city: dbUser.city,
        country: dbUser.country,
        postalCode: dbUser.postalCode,
        streetAddress: dbUser.streetAddress,
      };
    },

    // 🔹 Controls what session object looks like
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...(session.user as User),
          id: token.id,
          name: token.name!,
          email: token.email!,
          role: token.role,
          image: token.image as string,
          phone: token.phone as string,
          city: token.city as string,
          country: token.country as string,
          postalCode: token.postalCode as string,
          streetAddress: token.streetAddress as string,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: `/${Routes.AUTH}/${Pages.LOGIN}`,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === Environments.DEV,
};

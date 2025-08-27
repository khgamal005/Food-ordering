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
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        try {
          const currentUrl = req?.headers?.referer;
          const locale = currentUrl?.split("/")[3] as Locale;

          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error(JSON.stringify({
              validationError: {
                email: !credentials?.email ? "Email is required" : undefined,
                password: !credentials?.password ? "Password is required" : undefined,
              },
            }));
          }

          // Call your login function
          const user = await login(credentials, locale);
          
          if (!user) {
            throw new Error(JSON.stringify({
              validationError: {
                general: "Invalid credentials",
              },
            }));
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role,
          };

        } catch (error: any) {
          // Pass through the validation error
          if (error.message.includes('validationError')) {
            throw error;
          }
          // For other errors, throw a generic error
          throw new Error(JSON.stringify({
            validationError: {
              general: "Authentication failed",
            },
          }));
        }
      },
    }),
  ],
  pages: {
    signIn: `/${Routes.AUTH}/${Pages.LOGIN}`,
    error: `/${Routes.AUTH}/${Pages.LOGIN}`, // Redirect errors back to login
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email!;
        session.user.name = token.name;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
import NextAuth from "next-auth";
import { AuthOptions } from "next-auth"; // Optional: for type safety

// Define your authOptions object here
const authOptions: AuthOptions = {
  // Add your providers and other NextAuth options here
  providers: [],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { comparePassword } from "@/lib/utils/password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        await dbConnect();

        const email = credentials.email.toLowerCase().trim();
        const user = await UserModel.findOne({
          email,
        });

        if (!user) {
          console.log(`[Auth] User not found: ${email}`);
          return null;
        }

        // Check active status (both admin and customer must be active)
        if (!user.isActive) {
          console.log(`[Auth] User ${email} is not active`);
          return null;
        }

        const isValid = await comparePassword(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          console.log(`[Auth] Invalid password for user ${email}`);
          return null;
        }

        // Allow both admin and customer to login
        console.log(`[Auth] Successfully authenticated user ${email} (role: ${user.role})`);
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as "admin" | "customer",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};



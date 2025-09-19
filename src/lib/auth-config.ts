import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const { email, password } = loginSchema.parse(credentials);

          const db = getDb();
          const [user] = await db
            .select({
              id: users.id,
              email: users.email,
              password: users.password,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isValidPassword = await verifyPassword(password, user.password);

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const db = getDb();

          // Check if user already exists
          let [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1);

          if (!existingUser) {
            // Create new user for Google OAuth
            const [newUser] = await db
              .insert(users)
              .values({
                email: user.email!,
                password: await hashPassword("google_oauth_user"), // Dummy password for OAuth users
              })
              .returning();
            existingUser = newUser;
          }

          // Update user object with database ID
          user.id = existingUser.id.toString();
        } catch (error) {
          console.error("Google OAuth error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

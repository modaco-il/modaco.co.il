import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phone: { label: "Phone", type: "tel" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;
        const password = credentials.password as string;

        // Find user by email or phone
        const email = credentials.email as string | undefined;
        const phone = credentials.phone as string | undefined;

        const user = await db.user.findFirst({
          where: email ? { email } : phone ? { phone } : undefined,
          include: { customer: { include: { group: true } } },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          customerGroupId: user.customer?.groupId || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role;
        token.customerGroupId = (user as Record<string, unknown>).customerGroupId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).customerGroupId = token.customerGroupId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

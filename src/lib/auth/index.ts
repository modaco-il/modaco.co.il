import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * Whitelist of emails that get role=ADMIN automatically on Google
 * sign-in. Yarin's account doesn't have a password yet — he logs in
 * via Google — so without this, his first sign-in would create a
 * CUSTOMER row and bounce him out of /admin.
 *
 * Existing CUSTOMER rows whose email matches the list also get
 * promoted to ADMIN on next sign-in (lets us recover from a wrong
 * historical seed without touching the DB).
 *
 * Override with ADMIN_EMAILS env var (comma-separated, lowercased).
 */
const ADMIN_EMAILS_DEFAULT = [
  "yarin@modaco.co.il",
  "ozkaballa@gmail.com",
];

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return ADMIN_EMAILS_DEFAULT;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const promoteToAdmin = isAdminEmail(user.email);
        const targetRole = promoteToAdmin ? "ADMIN" : "CUSTOMER";

        const existing = await db.user.findUnique({
          where: { email: user.email },
        });
        if (!existing) {
          const created = await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: targetRole,
              emailVerified: new Date(),
            },
          });
          // Customers get a Customer row for orders/addresses; admins
          // don't need one unless they happen to also buy as themselves.
          if (!promoteToAdmin) {
            await db.customer.create({ data: { userId: created.id } });
          }
        } else if (promoteToAdmin && existing.role !== "ADMIN") {
          // Email is in the admin whitelist but the row sits as CUSTOMER
          // (legacy seed, prior environment, etc.) — promote it.
          await db.user.update({
            where: { id: existing.id },
            data: { role: "ADMIN" },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Credentials flow already attaches role/customerGroupId in
        // authorize(). Google flow doesn't — the OAuth profile has no
        // notion of our role. Fall back to a DB lookup so the JWT
        // always carries the canonical values.
        const userRole = (user as Record<string, unknown>).role;
        const userGroup = (user as Record<string, unknown>).customerGroupId;
        if (userRole) {
          token.role = userRole;
          token.customerGroupId = userGroup;
        } else if (user.email) {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
            include: { customer: { select: { groupId: true } } },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.customerGroupId = dbUser.customer?.groupId || null;
          }
        }
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

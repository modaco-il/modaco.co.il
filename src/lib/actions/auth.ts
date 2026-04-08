"use server";

import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  email: z.string().email("אימייל לא ת��ין"),
  phone: z.string().min(9, "מספר טלפון לא תקין"),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
});

export async function register(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.parse(raw);

  // Check if user exists
  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: parsed.email }, { phone: parsed.phone }],
    },
  });

  if (existing) {
    return { success: false, error: "משתמש עם אימייל או טלפון זה כבר קיים" };
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const user = await db.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      passwordHash,
      role: "CUSTOMER",
      customer: {
        create: {},
      },
    },
  });

  // Auto sign in
  await signIn("credentials", {
    email: parsed.email,
    password: parsed.password,
    redirect: false,
  });

  return { success: true, userId: user.id };
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { success: false, error: "אימייל או סיסמה שגויים" };
  }
}

export async function logout() {
  await signOut({ redirect: false });
  return { success: true };
}

// Admin-only: create initial admin user
export async function createAdminUser(
  email: string,
  password: string,
  name: string
) {
  const passwordHash = await bcrypt.hash(password, 12);

  return db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });
}

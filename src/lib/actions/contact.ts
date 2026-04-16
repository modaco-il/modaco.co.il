"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";

export interface ContactFormResult {
  success: boolean;
  error?: string;
}

const NAME_MAX = 100;
const PHONE_MAX = 32;
const EMAIL_MAX = 254;
const SUBJECT_MAX = 200;
const MESSAGE_MAX = 4000;

export async function submitContactForm(
  formData: FormData
): Promise<ContactFormResult> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const honeypot = String(formData.get("website") || "").trim();

  if (honeypot) return { success: true };

  if (!name || name.length > NAME_MAX) {
    return { success: false, error: "נא למלא שם תקין" };
  }
  if (!phone || phone.length > PHONE_MAX) {
    return { success: false, error: "נא למלא מספר טלפון תקין" };
  }
  if (email && email.length > EMAIL_MAX) {
    return { success: false, error: "כתובת אימייל ארוכה מדי" };
  }
  if (subject.length > SUBJECT_MAX) {
    return { success: false, error: "נושא ארוך מדי" };
  }
  if (!message || message.length > MESSAGE_MAX) {
    return { success: false, error: "נא לכתוב הודעה (עד 4000 תווים)" };
  }

  const h = await headers();
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    null;
  const userAgent = h.get("user-agent") || null;

  try {
    await db.contactMessage.create({
      data: {
        name,
        phone,
        email: email || null,
        subject: subject || null,
        message,
        ipAddress,
        userAgent,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[contact.submit]", error);
    return {
      success: false,
      error: "אירעה שגיאה זמנית. נסו שוב או התקשרו ישירות: 052-680-4945",
    };
  }
}

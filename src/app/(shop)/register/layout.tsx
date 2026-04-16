import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הרשמה",
  description: "פתיחת חשבון Modaco — להזמנות, מחירים אישיים ומעקב הזמנות.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

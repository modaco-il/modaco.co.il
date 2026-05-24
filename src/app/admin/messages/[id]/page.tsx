export const dynamic = "force-dynamic";

/**
 * /admin/messages/[id] — single message view + status workflow.
 *
 * Surfaces the full message, the technical metadata (IP/UA for spam
 * detection), and three quick actions: WhatsApp, call, email.
 * Status transitions sit in a small client component so Yarin can
 * snap NEW → IN_PROGRESS in one tap.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { MessageStatusActions } from "./status-actions";

const statusLabels: Record<string, string> = {
  NEW: "חדשה",
  IN_PROGRESS: "בטיפול",
  RESOLVED: "טופלה",
  SPAM: "ספאם",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
  SPAM: "bg-red-100 text-red-800",
};

function toWaPhone(p: string): string {
  const clean = p.replace(/[^\d]/g, "");
  return clean.startsWith("0") ? "972" + clean.slice(1) : clean;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MessageDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const msg = await db.contactMessage.findUnique({ where: { id } });
  if (!msg) notFound();

  const waPhone = toWaPhone(msg.phone);
  // Personalised greeting reply — Yarin can edit before sending.
  const waReplyText = encodeURIComponent(
    `שלום ${msg.name.split(" ")[0]},\n\nתודה שפנית למודקו.${msg.subject ? ` ראיתי את הפנייה שלך לגבי ${msg.subject}.` : ""} אני זמין לכל שאלה — איך אפשר לעזור?\n\nירין | Modaco`,
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/admin/messages" className="text-gray-500 hover:text-gray-900">
          ← הודעות
        </Link>
        <span
          className={`px-3 py-1 rounded text-xs ${statusColors[msg.status]}`}
        >
          {statusLabels[msg.status]}
        </span>
      </div>

      <header className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{msg.name}</h1>
        <div className="text-sm text-gray-500">
          {new Date(msg.createdAt).toLocaleString("he-IL")}
        </div>
      </header>

      {/* Action row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <a
          href={`https://wa.me/${waPhone}?text=${waReplyText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-14 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          WhatsApp
        </a>
        <a
          href={`tel:${msg.phone}`}
          className="flex items-center justify-center gap-2 h-14 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {msg.phone}
        </a>
        {msg.email ? (
          <a
            href={`mailto:${msg.email}?subject=${encodeURIComponent("Re: " + (msg.subject || "פנייה ל-Modaco"))}`}
            className="flex items-center justify-center gap-2 h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            מייל
          </a>
        ) : (
          <div className="flex items-center justify-center h-14 bg-gray-100 text-gray-400 rounded-lg text-sm">
            אין מייל
          </div>
        )}
      </div>

      <MessageStatusActions
        messageId={msg.id}
        currentStatus={msg.status}
      />

      {/* Message body */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        {msg.subject && (
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
              נושא
            </div>
            <div className="font-medium">{msg.subject}</div>
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            ההודעה
          </div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {msg.message}
          </div>
        </div>
      </section>

      {/* Metadata — useful for spam triage */}
      <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600 space-y-1">
        <div>
          <strong>מקור:</strong> {msg.source}
        </div>
        {msg.ipAddress && (
          <div>
            <strong>IP:</strong> <span className="font-mono">{msg.ipAddress}</span>
          </div>
        )}
        {msg.userAgent && (
          <div className="break-all">
            <strong>UA:</strong> <span className="font-mono">{msg.userAgent}</span>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Two-tier admin permissions.
 *
 * - role=ADMIN  → the day-to-day operator (Yarin). Full product CRUD,
 *                 order workflow, message replies, abandoned-cart
 *                 recovery, customer notes. Cannot touch structural
 *                 settings that affect pricing or invariants.
 *
 * - superAdmin → me (Oz). Identified by email match against the
 *                SUPERADMIN_EMAILS env var (comma-separated). Can do
 *                everything an ADMIN can plus:
 *                  • create / edit / delete CustomerGroups (affects
 *                    B2B pricing across the catalogue)
 *                  • move an order's status backward
 *                    (PAID → PENDING etc.) — forward + cancel/refund
 *                    are always allowed for ADMIN
 *                  • any other future "structural" mutation
 *
 * Implementation note: this is a thin overlay on top of the existing
 * NextAuth `role` enum. We deliberately don't add another column to
 * User — superadmin status follows the email, so if Oz logs in from
 * any device it just works, and there's nothing to revoke if access
 * needs to change (drop the email from the env var).
 */

const DEFAULT_SUPERADMINS = ["ozkaballa@gmail.com"];

function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPERADMIN_EMAILS;
  if (!raw) return DEFAULT_SUPERADMINS;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

type SessionLike = {
  user?: { email?: string | null } | null;
} | null
  | undefined;

/** True if the current session belongs to a configured superadmin. */
export function isSuperAdmin(session: SessionLike): boolean {
  const email = session?.user?.email?.toLowerCase();
  if (!email) return false;
  return getSuperAdminEmails().includes(email);
}

/** True if the session has at least ADMIN role (Yarin or higher). */
export function isAdminRole(session: SessionLike): boolean {
  const role = (session?.user as { role?: string } | null | undefined)?.role;
  return role === "ADMIN";
}

/** Status ordering used for "no going backward" rule. */
const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

/**
 * Decide whether a non-superadmin (Yarin) is allowed to make this
 * order-status transition. The rule:
 *   - Always allowed: CANCELLED, REFUNDED (lateral; needed for daily ops)
 *   - Otherwise: only forward moves through the linear pipeline
 *
 * Backward moves and "un-cancelling" require superadmin.
 */
export function canTransitionOrderStatus(
  from: string,
  to: string,
): { ok: boolean; reason?: string } {
  if (from === to) return { ok: true };
  if (to === "CANCELLED" || to === "REFUNDED") return { ok: true };

  const f = STATUS_ORDER[from];
  const t = STATUS_ORDER[to];
  if (f === undefined || t === undefined) {
    // From CANCELLED/REFUNDED back into the pipeline — that's a revive.
    // Only superadmin should be able to do that.
    return { ok: false, reason: "מעבר ממצב מבוטל/הוחזר אסור (פנה אל הבעלים)" };
  }
  if (t < f) {
    return { ok: false, reason: "אי אפשר להחזיר הזמנה אחורה (פנה אל הבעלים)" };
  }
  return { ok: true };
}

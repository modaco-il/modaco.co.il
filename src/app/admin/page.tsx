import { redirect } from "next/navigation";

/**
 * /admin → /admin/dashboard
 *
 * Before this file existed, hitting /admin directly (the natural URL Yarin
 * remembers) returned 404 because the admin route only had a layout.tsx,
 * no index page. After auth redirected the user back to /admin post-login
 * they'd land on the same 404. This sends them straight to the dashboard
 * where they actually want to be.
 */
export default function AdminIndex() {
  redirect("/admin/dashboard");
}

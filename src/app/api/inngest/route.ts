import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  abandonedCartCheck,
  orderCreatedNotify,
  lowStockAlert,
  dailySummary,
} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [abandonedCartCheck, orderCreatedNotify, lowStockAlert, dailySummary],
});

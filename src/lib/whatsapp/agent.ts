import { db } from "@/lib/db";

// Admin phone number (Yarin) — will be loaded from env
const ADMIN_PHONE = process.env.WHATSAPP_ADMIN_PHONE || "";

interface AgentResponse {
  text: string;
  action?: string;
  data?: Record<string, unknown>;
}

interface ParsedCommand {
  intent:
    | "add_product"
    | "update_product"
    | "check_sales"
    | "check_stock"
    | "order_status"
    | "send_customer_message"
    | "unknown";
  params: Record<string, string>;
}

/**
 * Parse a Hebrew message from Yarin into a structured command.
 * In production this will use Claude API for NLU.
 * For now, pattern matching.
 */
function parseCommand(message: string): ParsedCommand {
  const msg = message.trim();

  // "תעלה מוצר" / "תוסיף מוצר" + URL
  const urlMatch = msg.match(/(https?:\/\/[^\s]+)/);
  if (
    (msg.includes("תעלה") || msg.includes("תוסיף")) &&
    msg.includes("מוצר") &&
    urlMatch
  ) {
    return { intent: "add_product", params: { url: urlMatch[1] } };
  }

  // "תוסיף צבע/וריאנט" to product
  if (msg.includes("תוסיף") && (msg.includes("צבע") || msg.includes("וריאנט"))) {
    return { intent: "update_product", params: { raw: msg } };
  }

  // "כמה מכרנו" / "מכירות"
  if (msg.includes("מכרנו") || msg.includes("מכירות")) {
    const period = msg.includes("היום")
      ? "today"
      : msg.includes("שבוע")
        ? "week"
        : msg.includes("חודש")
          ? "month"
          : "today";
    return { intent: "check_sales", params: { period } };
  }

  // "מלאי" / "סטוק"
  if (msg.includes("מלאי") || msg.includes("סטוק")) {
    return { intent: "check_stock", params: { raw: msg } };
  }

  // "הזמנה" + number
  const orderMatch = msg.match(/הזמנה\s*(MOD-?\d+|\d+)/i);
  if (orderMatch) {
    return {
      intent: "order_status",
      params: { orderNumber: orderMatch[1] },
    };
  }

  return { intent: "unknown", params: { raw: msg } };
}

/**
 * Handle sales query
 */
async function handleSalesQuery(period: string): Promise<AgentResponse> {
  const now = new Date();
  let since: Date;

  if (period === "week") {
    since = new Date(now);
    since.setDate(since.getDate() - 7);
  } else if (period === "month") {
    since = new Date(now);
    since.setMonth(since.getMonth() - 1);
  } else {
    since = new Date(now);
    since.setHours(0, 0, 0, 0);
  }

  const [orderCount, revenue] = await Promise.all([
    db.order.count({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    }),
    db.order.aggregate({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
  ]);

  const periodHeb =
    period === "today" ? "היום" : period === "week" ? "השבוע" : "החודש";

  return {
    text: `📊 ${periodHeb}:\n🛒 ${orderCount} הזמנות\n💰 ₪${(revenue._sum.total || 0).toLocaleString()}`,
    action: "sales_report",
  };
}

/**
 * Handle order status query
 */
async function handleOrderStatus(
  orderNumber: string
): Promise<AgentResponse> {
  const normalizedNumber = orderNumber.startsWith("MOD-")
    ? orderNumber
    : `MOD-${orderNumber.padStart(4, "0")}`;

  const order = await db.order.findUnique({
    where: { orderNumber: normalizedNumber },
    include: {
      customer: { include: { user: true } },
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  if (!order) {
    return { text: `לא מצאתי הזמנה ${normalizedNumber}` };
  }

  const statusMap: Record<string, string> = {
    PENDING: "⏳ ממתינה",
    PAID: "✅ שולמה",
    PROCESSING: "📦 בטיפול",
    SHIPPED: "🚚 נשלחה",
    DELIVERED: "✔️ הגיעה",
    CANCELLED: "❌ בוטלה",
    REFUNDED: "↩️ הוחזרה",
  };

  const items = order.items
    .map((i) => `  • ${i.variant.product.name} x${i.quantity}`)
    .join("\n");

  return {
    text: [
      `📋 הזמנה ${order.orderNumber}`,
      `סטטוס: ${statusMap[order.status] || order.status}`,
      `לקוח: ${order.customer.user.name || order.customer.user.phone}`,
      `פריטים:\n${items}`,
      `סה"כ: ₪${order.total.toLocaleString()}`,
      order.trackingNumber ? `מעקב: ${order.trackingNumber}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    action: "order_status",
    data: { orderId: order.id },
  };
}

/**
 * Main agent entry point.
 * Receives a message from Yarin, returns a response.
 */
export async function handleAdminMessage(
  message: string,
  senderPhone: string
): Promise<AgentResponse> {
  // Only respond to admin
  if (senderPhone !== ADMIN_PHONE) {
    return { text: "אין לך הרשאה לגשת למערכת הניהול." };
  }

  const command = parseCommand(message);

  switch (command.intent) {
    case "add_product":
      // TODO: trigger scraper pipeline
      return {
        text: `📥 מתחיל לייבא מוצר מ:\n${command.params.url}\n\nאשלח לך תצוגה מקדימה לאישור בעוד רגע...`,
        action: "import_product",
        data: { url: command.params.url },
      };

    case "update_product":
      // TODO: NLU with Claude to understand exact change
      return {
        text: `✏️ קיבלתי: "${command.params.raw}"\n\nמעבד את הבקשה...`,
        action: "update_product",
      };

    case "check_sales":
      return handleSalesQuery(command.params.period);

    case "check_stock":
      // TODO: search products by name
      return {
        text: "🔍 מחפש מידע על מלאי...",
        action: "check_stock",
      };

    case "order_status":
      return handleOrderStatus(command.params.orderNumber);

    case "unknown":
    default:
      // TODO: In production, send to Claude API for understanding
      return {
        text: [
          "🤖 לא הבנתי. אני יודע לעשות:",
          "",
          '📥 "תעלה מוצר מ-[URL]"',
          '✏️ "תוסיף צבע ברונזה למוצר X"',
          '📊 "כמה מכרנו היום/השבוע/החודש?"',
          '📋 "סטטוס הזמנה 1234"',
          '📦 "מה המלאי של [מוצר]?"',
        ].join("\n"),
      };
  }
}

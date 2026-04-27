import { inngest } from "./client";
import { db } from "@/lib/db";

// ==================== ABANDONED CART RECOVERY ====================

export const abandonedCartCheck = inngest.createFunction(
  {
    id: "abandoned-cart-check",
    name: "Check Abandoned Cart",
    triggers: [{ event: "cart/updated" }],
  },
  async ({ event, step }) => {
    const cartId = event.data.cartId as string;

    // Wait 30 minutes
    await step.sleep("wait-for-purchase", "30m");

    // Check if cart was converted
    const cart = await step.run("check-cart", async () => {
      return db.cart.findUnique({
        where: { id: cartId },
        include: {
          customer: { include: { user: true } },
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    });

    if (!cart || cart.convertedAt) {
      return { status: "cart-converted-or-deleted" };
    }

    if (cart.recoverySentAt) {
      return { status: "recovery-already-sent" };
    }

    // Mark as abandoned
    await step.run("mark-abandoned", async () => {
      await db.cart.update({
        where: { id: cartId },
        data: { abandonedAt: new Date() },
      });
    });

    // Send WhatsApp recovery message if customer has phone
    const phone = cart.customer?.user?.phone;
    if (phone) {
      await step.run("send-whatsapp-recovery", async () => {
        // TODO: integrate with Meta Cloud API
        console.log(`[WA] Sending cart recovery to ${phone}`);
        await db.cart.update({
          where: { id: cartId },
          data: { recoverySentAt: new Date() },
        });
      });
    }

    return { status: "recovery-sent", phone };
  }
);

// ==================== ORDER NOTIFICATIONS ====================

export const orderCreatedNotify = inngest.createFunction(
  {
    id: "order-created-notify",
    name: "Notify on New Order",
    triggers: [{ event: "order/created" }],
  },
  async ({ event, step }) => {
    const orderId = event.data.orderId as string;

    const order = await step.run("fetch-order", async () => {
      return db.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          customer: { include: { user: true } },
          address: true,
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    });

    const customerName =
      order.address?.fullName || order.customer?.user?.name || order.customer?.user?.email || "—";
    const customerPhone = order.address?.phone || order.customer?.user?.phone || "";
    const fullAddress = order.address
      ? `${order.address.street}, ${order.address.city}${order.address.zipCode ? " " + order.address.zipCode : ""}`
      : "(אין כתובת)";
    const itemsText = order.items
      .map((i) => `• ${i.variant.product.name} (${i.variant.name}) × ${i.quantity}  — ₪${i.total.toLocaleString()}`)
      .join("\n");

    // Email to Yarin — full picking + shipping brief
    await step.run("email-yarin", async () => {
      const adminUrl = `https://modaco.co.il/admin/orders/${order.id}`;
      const wazeUrl = order.address
        ? `https://waze.com/ul?q=${encodeURIComponent(fullAddress)}&navigate=yes`
        : null;
      const cleanPhone = customerPhone.replace(/[^\d]/g, "");
      const waPhone = cleanPhone.startsWith("0") ? "972" + cleanPhone.slice(1) : cleanPhone;
      const waUrl = customerPhone
        ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`שלום, תודה על ההזמנה ${order.orderNumber} ב-Modaco.`)}`
        : null;

      const body = [
        `הזמנה חדשה ב-Modaco — ${order.orderNumber}`,
        ``,
        `לקוח: ${customerName}`,
        customerPhone ? `טלפון: ${customerPhone}` : "",
        `כתובת: ${fullAddress}`,
        ``,
        `פריטים (${order.items.length}):`,
        itemsText,
        ``,
        `סה"כ: ₪${order.total.toLocaleString()}`,
        ``,
        `--- קישורים מהירים ---`,
        `פאנל ניהול: ${adminUrl}`,
        wazeUrl ? `Waze: ${wazeUrl}` : "",
        waUrl ? `WhatsApp ללקוח: ${waUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      console.log(`[Email→Yarin]\n${body}`);

      // TODO: send via Resend once RESEND_API_KEY is set
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Modaco <orders@modaco.co.il>",
              to: ["yarin@modaco.co.il"],
              subject: `הזמנה חדשה ${order.orderNumber} — ₪${order.total.toLocaleString()}`,
              text: body,
            }),
          });
        } catch (e) {
          console.error("Resend failed:", e);
        }
      }
    });

    // WhatsApp alert to Yarin (placeholder — Meta Cloud API verification pending)
    await step.run("notify-admin-whatsapp", async () => {
      const summary = `הזמנה חדשה ${order.orderNumber}\n${customerName}\nסה"כ ₪${order.total.toLocaleString()}\nhttps://modaco.co.il/admin/orders/${order.id}`;
      console.log(`[WA→Admin pending Meta]\n${summary}`);
      // TODO: integrate with Meta Cloud API once Business verified
    });

    // Email confirmation to customer
    await step.run("send-customer-email", async () => {
      const email = order.customer?.user?.email;
      if (!email) return;
      console.log(`[Email→Customer] confirmation to ${email}`);
      // TODO: integrate with transactional email
    });

    // Create invoice
    await step.run("create-invoice", async () => {
      console.log(`[Invoice] Creating Green Invoice for ${order.orderNumber}`);
      // TODO: integrate with Green Invoice API once credentials provided
    });

    await step.run("log-event", async () => {
      await db.orderEvent.create({
        data: {
          orderId,
          type: "notifications_sent",
          data: { yarinEmail: true, yarinWA: !!process.env.WHATSAPP_ACCESS_TOKEN, customerEmail: !!order.customer?.user?.email, invoice: !!process.env.GREEN_INVOICE_API_KEY },
        },
      });
    });

    return { status: "notifications-sent", orderNumber: order.orderNumber };
  }
);

// ==================== LOW STOCK ALERT ====================

export const lowStockAlert = inngest.createFunction(
  {
    id: "low-stock-alert",
    name: "Low Stock Alert",
    triggers: [{ event: "stock/updated" }],
  },
  async ({ event, step }) => {
    const variantId = event.data.variantId as string;
    const LOW_STOCK_THRESHOLD = 3;

    const variant = await step.run("check-stock", async () => {
      return db.variant.findUniqueOrThrow({
        where: { id: variantId },
        include: { product: true },
      });
    });

    const totalStock = variant.stockStore + variant.stockSupplier;

    if (totalStock <= LOW_STOCK_THRESHOLD) {
      await step.run("alert-admin", async () => {
        console.log(
          `[WA→Admin] מלאי נמוך: ${variant.product.name} (${variant.name}) — נשארו ${totalStock}`
        );
        // TODO: integrate with Meta Cloud API
      });

      if (totalStock === 0) {
        await step.run("update-stock-status", async () => {
          await db.variant.update({
            where: { id: variantId },
            data: { stockStatus: "OUT_OF_STOCK" },
          });
        });
      }
    }

    return { totalStock, alerted: totalStock <= LOW_STOCK_THRESHOLD };
  }
);

// ==================== DAILY MORNING SUMMARY ====================

export const dailySummary = inngest.createFunction(
  {
    id: "daily-summary",
    name: "Daily Morning Summary for Yarin",
    triggers: [{ cron: "0 8 * * *" }], // Every day at 8:00 AM
  },
  async ({ step }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const stats = await step.run("gather-stats", async () => {
      const [newOrders, revenue, abandonedCarts, lowStockItems, pageViews] =
        await Promise.all([
          db.order.count({
            where: { createdAt: { gte: yesterday, lt: today } },
          }),
          db.order.aggregate({
            where: {
              createdAt: { gte: yesterday, lt: today },
              status: { not: "CANCELLED" },
            },
            _sum: { total: true },
          }),
          db.cart.count({
            where: { abandonedAt: { gte: yesterday, lt: today } },
          }),
          db.variant.count({
            where: { stockStatus: "OUT_OF_STOCK" },
          }),
          db.pageView.count({
            where: { createdAt: { gte: yesterday, lt: today } },
          }),
        ]);

      return {
        newOrders,
        revenue: revenue._sum.total || 0,
        abandonedCarts,
        lowStockItems,
        pageViews,
      };
    });

    await step.run("send-summary", async () => {
      const msg = [
        `סיכום יומי — ${yesterday.toLocaleDateString("he-IL")}`,
        ``,
        `הזמנות חדשות: ${stats.newOrders}`,
        `הכנסות: ${stats.revenue.toLocaleString()} שח`,
        `עגלות נטושות: ${stats.abandonedCarts}`,
        `מוצרים אזלו: ${stats.lowStockItems}`,
        `צפיות באתר: ${stats.pageViews}`,
      ].join("\n");

      console.log(`[WA→Admin]\n${msg}`);
      // TODO: integrate with Meta Cloud API
    });

    return stats;
  }
);

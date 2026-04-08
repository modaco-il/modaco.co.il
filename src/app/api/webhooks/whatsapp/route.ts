import { NextRequest, NextResponse } from "next/server";
import { handleAdminMessage } from "@/lib/whatsapp/agent";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";

// Meta webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Incoming message (POST)
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      return NextResponse.json({ status: "no message" });
    }

    const message = value.messages[0];
    const senderPhone = message.from;
    const text = message.text?.body;

    if (!text) {
      return NextResponse.json({ status: "non-text message ignored" });
    }

    // Process with admin agent
    const response = await handleAdminMessage(text, senderPhone);

    // Send reply via WhatsApp Cloud API
    await sendWhatsAppMessage(senderPhone, response.text);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

async function sendWhatsAppMessage(to: string, text: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log(`[WA Mock] To: ${to}\n${text}`);
    return;
  }

  await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
}

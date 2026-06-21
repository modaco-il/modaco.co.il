/**
 * WhatsApp Cloud API webhook for Modaco's business number.
 *
 * GET  /api/webhooks/whatsapp — verification handshake (Meta calls this once
 *      when you wire the webhook in Meta Business Manager; it must echo back
 *      the hub.challenge string when hub.verify_token matches the env var).
 *
 * POST /api/webhooks/whatsapp — incoming message events. Meta posts here
 *      every time a customer sends a message to +972 53-347-8737. We hand
 *      the text to the admin agent for parsing (Hebrew + commands), then
 *      reply back via the same Graph API using `sendWhatsAppMessage()`.
 */
import { NextRequest, NextResponse } from "next/server";
import { handleAdminMessage } from "@/lib/whatsapp/agent";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";

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

    // Process with admin agent (parses Hebrew commands, calls DB tools)
    const response = await handleAdminMessage(text, senderPhone);

    // Reply back via WhatsApp Cloud API
    await sendWhatsAppMessage(senderPhone, response.text);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

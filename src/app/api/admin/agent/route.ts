/**
 * Admin agent endpoint. Yarin talks to Claude via the UI at /admin/agent;
 * Claude has the tools defined in lib/agent/tools.ts to actually mutate
 * the catalog. ADMIN role required.
 *
 * The agent loop:
 *   1. Send conversation + tool definitions to Claude
 *   2. If Claude returns tool_use blocks → execute, append tool_result, loop
 *   3. If Claude returns plain text → done
 *
 * Streaming SSE so the UI can show "thinking..." vs tool calls in real time.
 */
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, runTool } from "@/lib/agent/tools";

export const maxDuration = 300; // 5 min — scraping a whole category can take a while

// Sonnet 4.6 is the current production model — strong tool use, fast enough
// for the agent loop. Bump to Opus 4.7 if Yarin hits cases where Sonnet
// misclassifies a category or fumbles a multi-product order.
const MODEL = "claude-sonnet-4-6";
const MAX_TOOL_ITERATIONS = 25;

const SYSTEM_PROMPT = `אתה הסוכן של ירין מויאל, מנכ"ל מודקו (modaco.co.il) — חנות פרזול ואקססוריז לבית בבית שמש.

תפקידך: לעזור לירין לנהל את האתר. אתה עונה בעברית בקצרה ובטון מקצועי וחברי.

## יכולותיך (tools)
- scrape_product(url) — מציץ במוצר באתר ספק (Domicile/Nyga/Floralis) לפני שמוסיפים
- scrape_category(url) — מקבל רשימת כל המוצרים בקטגוריית ספק
- search_products(query) — בודק אם מוצר כבר קיים בקטלוג של מודקו
- list_categories() — מקבל את כל הקטגוריות הקיימות באתר עם slug + שם בעברית
- add_product_from_url(url, categorySlug, customName?, customPrice?) — מוסיף מוצר חדש
- update_product(productId, ...) — מעדכן מחיר/שם/סטטוס
- mark_out_of_stock(productId, outOfStock) — מסמן אזל מהמלאי
- add_category(slug, name, brand?, tagline?, shortDesc?, description?, cover?, featured?, bentoSize?) — מוסיף קטגוריה חדשה שמופיעה מיידית בכותרת, בפוטר, בדף הבית, ובקטלוג
- update_category(slug, ...) — מעדכן מטא-דאטה של קטגוריה קיימת (שם, מותג, תיאור, תמונת רקע וכו')

## עקרונות עבודה
1. **תמיד** רץ list_categories() לפני שמוסיף מוצר חדש — צריך לדעת לאיזו קטגוריה לשייך
2. **תמיד** רץ search_products() לפני הוספה כדי לא ליצור כפילויות
3. אם ירין נותן URL של קטגוריה ספק (לא מוצר בודד) — קודם scrape_category() ואז סקר כל URL ב-add_product_from_url
4. כשמסכם פעולה: דווח בעברית מספרים ברורים — "הועלו 12 מוצרים לקטגוריית אמבט"
5. אל תדמיין URLs או SKUs — אם אין נתון, שאל את ירין
6. אם מוסיפים קטגוריה חדשה לפני שיש בה מוצרים — מומלץ להגיד לירין שהיא תופיע באתר רק אחרי שיוסיפו לה לפחות מוצר אחד עם תמונה`;

export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY not configured. Add it to Vercel env to enable the agent.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = await req.json();
  const messages: Array<{ role: "user" | "assistant"; content: unknown }> = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey });

  // SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: { type: string; [k: string]: unknown }) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const convo = [...messages];
        let iteration = 0;

        while (iteration++ < MAX_TOOL_ITERATIONS) {
          send({ type: "thinking", iteration });

          const response = await client.messages.create({
            model: MODEL,
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: toolDefinitions,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: convo as any,
          });

          // Append assistant turn to conversation
          convo.push({ role: "assistant", content: response.content });

          // Find tool_use blocks
          const toolUses = response.content.filter((b) => b.type === "tool_use");
          const textBlocks = response.content.filter((b) => b.type === "text");

          // Stream text immediately
          for (const block of textBlocks) {
            if (block.type === "text") {
              send({ type: "text", text: block.text });
            }
          }

          if (toolUses.length === 0) {
            // No more tool calls — agent is done
            send({ type: "done", stopReason: response.stop_reason });
            break;
          }

          // Run each tool, collect results
          const toolResults: Array<{ type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }> = [];
          for (const block of toolUses) {
            if (block.type !== "tool_use") continue;
            send({ type: "tool_call", name: block.name, input: block.input });

            try {
              const result = await runTool(block.name, block.input as Record<string, unknown>);
              const resultJson = JSON.stringify(result);
              send({ type: "tool_result", name: block.name, ok: true, result });
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: resultJson,
              });
            } catch (err) {
              const msg = (err as Error).message;
              send({ type: "tool_result", name: block.name, ok: false, error: msg });
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify({ error: msg }),
                is_error: true,
              });
            }
          }

          // Feed tool results back to Claude
          convo.push({ role: "user", content: toolResults });
        }

        if (iteration >= MAX_TOOL_ITERATIONS) {
          send({ type: "limit_reached", message: "agent stopped after 25 iterations" });
        }
      } catch (err) {
        send({ type: "error", message: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

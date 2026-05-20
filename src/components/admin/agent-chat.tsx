"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, User, Wrench, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";

/**
 * SSE-streamed chat between Yarin and Claude. Renders three kinds of blocks:
 *  - user / assistant text
 *  - "thinking..." indicator while Claude composes
 *  - tool_call + tool_result cards so Yarin can audit what the agent did
 *
 * Wire format matches /api/admin/agent — see route.ts for event types.
 */

interface ChatMsg {
  role: "user" | "assistant";
  // Claude content blocks: we keep the raw structure so that on the next API
  // call we can resend it verbatim (assistant turns include tool_use blocks).
  content: string | unknown[];
}

interface UiBlock {
  id: string;
  kind: "user-text" | "assistant-text" | "tool-call" | "tool-result" | "thinking" | "error" | "done";
  text?: string;
  toolName?: string;
  toolInput?: unknown;
  toolOk?: boolean;
  toolResult?: unknown;
  toolError?: string;
}

export function AgentChat() {
  const [conversation, setConversation] = useState<ChatMsg[]>([]);
  const [uiBlocks, setUiBlocks] = useState<UiBlock[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [uiBlocks]);

  async function send() {
    const userText = input.trim();
    if (!userText || busy) return;
    setInput("");
    setBusy(true);

    const userMsg: ChatMsg = { role: "user", content: userText };
    const nextConvo = [...conversation, userMsg];
    setConversation(nextConvo);
    setUiBlocks((b) => [...b, { id: rid(), kind: "user-text", text: userText }]);

    try {
      const resp = await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextConvo }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
        setUiBlocks((b) => [...b, { id: rid(), kind: "error", text: err.error || "שגיאת רשת" }]);
        setBusy(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      // The agent loop on the server may emit multiple assistant turns;
      // we collect ALL assistant content blocks (text + tool_use) so we can
      // rebuild the canonical conversation history for the next user turn.
      const assistantBlocks: { type: string; [k: string]: unknown }[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const block of events) {
          const line = block.trim();
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          handleEvent(payload, setUiBlocks, assistantBlocks);
        }
      }

      // Persist assistant content blocks so next user turn carries full context
      setConversation((prev) => [...prev, { role: "assistant", content: assistantBlocks }]);
    } catch (e) {
      setUiBlocks((b) => [...b, { id: rid(), kind: "error", text: (e as Error).message }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {uiBlocks.length === 0 && (
          <div className="text-center text-gray-400 text-sm pt-12">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-40" />
            התחל בכך שתכתוב מה אתה רוצה לעשות.
          </div>
        )}
        {uiBlocks.map((b) => (
          <BlockRender key={b.id} block={b} />
        ))}
        {busy && uiBlocks[uiBlocks.length - 1]?.kind !== "thinking" && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            עובד...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 flex gap-2 bg-gray-50">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={busy}
          placeholder="לדוגמה: תעלה את המוצר https://www.domicile.co.il/product/..."
          rows={2}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          dir="rtl"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="h-11 self-end px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          שלח
        </button>
      </div>
    </div>
  );
}

function handleEvent(
  ev: { type: string; [k: string]: unknown },
  setUi: (fn: (b: UiBlock[]) => UiBlock[]) => void,
  assistantBlocks: { type: string; [k: string]: unknown }[],
) {
  switch (ev.type) {
    case "thinking":
      setUi((b) => {
        // Don't stack thinking indicators
        if (b[b.length - 1]?.kind === "thinking") return b;
        return [...b, { id: rid(), kind: "thinking" }];
      });
      break;
    case "text":
      setUi((b) => {
        // Drop any trailing thinking indicator
        const tail = b[b.length - 1];
        const base = tail?.kind === "thinking" ? b.slice(0, -1) : b;
        return [...base, { id: rid(), kind: "assistant-text", text: ev.text as string }];
      });
      assistantBlocks.push({ type: "text", text: ev.text as string });
      break;
    case "tool_call":
      setUi((b) => {
        const tail = b[b.length - 1];
        const base = tail?.kind === "thinking" ? b.slice(0, -1) : b;
        return [
          ...base,
          {
            id: rid(),
            kind: "tool-call",
            toolName: ev.name as string,
            toolInput: ev.input,
          },
        ];
      });
      // We deliberately do NOT push tool_use blocks into the saved conversation.
      // Cross-turn replay of tool_use without matching tool_result blocks would
      // make Claude reject the next request. The agent's final TEXT summary
      // already captures what was done, so the next turn has enough context.
      break;
    case "tool_result":
      setUi((b) => [
        ...b,
        {
          id: rid(),
          kind: "tool-result",
          toolName: ev.name as string,
          toolOk: ev.ok as boolean,
          toolResult: ev.result,
          toolError: ev.error as string | undefined,
        },
      ]);
      break;
    case "done":
      // No-op for UI; we already showed text
      break;
    case "limit_reached":
    case "error":
      setUi((b) => [...b, { id: rid(), kind: "error", text: ev.message as string }]);
      break;
  }
}

function BlockRender({ block }: { block: UiBlock }) {
  switch (block.kind) {
    case "user-text":
      return (
        <div className="flex gap-3 justify-end">
          <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm whitespace-pre-wrap">
            {block.text}
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-700" />
          </div>
        </div>
      );
    case "assistant-text":
      return (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-purple-700" />
          </div>
          <div className="max-w-[80%] bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed">
            {block.text}
          </div>
        </div>
      );
    case "thinking":
      return (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-purple-700" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            חושב...
          </div>
        </div>
      );
    case "tool-call":
      return (
        <div className="ml-11 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Wrench className="w-3.5 h-3.5" />
            קריאה: <span className="font-mono">{block.toolName}</span>
          </div>
          {Boolean(block.toolInput) && Object.keys((block.toolInput ?? {}) as Record<string, unknown>).length > 0 ? (
            <pre className="mt-1.5 text-amber-800 text-[11px] font-mono overflow-x-auto max-h-32">
              {JSON.stringify(block.toolInput, null, 2)}
            </pre>
          ) : null}
        </div>
      );
    case "tool-result":
      return (
        <div
          className={`ml-11 rounded-lg px-3 py-2 text-xs border ${
            block.toolOk ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 font-medium ${
              block.toolOk ? "text-emerald-900" : "text-red-900"
            }`}
          >
            {block.toolOk ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span className="font-mono">{block.toolName}</span> · {block.toolOk ? "תוצאה" : "שגיאה"}
          </div>
          <pre
            className={`mt-1.5 text-[11px] font-mono overflow-x-auto max-h-40 ${
              block.toolOk ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {block.toolOk
              ? JSON.stringify(block.toolResult, null, 2)
              : block.toolError}
          </pre>
        </div>
      );
    case "error":
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-900">
          ✗ {block.text}
        </div>
      );
    default:
      return null;
  }
}

function rid(): string {
  return Math.random().toString(36).slice(2, 10);
}

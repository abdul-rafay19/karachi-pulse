"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { AreaState, ChatAction, ChatResponse, ChatTurn, DashboardMetrics, WeatherSnapshot } from "@/types";
import { ChatMessageBubble } from "./ChatMessage";

interface DisplayMessage extends ChatTurn {
  actions?: ChatAction[];
  degraded?: boolean;
}

const SUGGESTIONS = ["Is it safe in Korangi right now?", "Where's the highest risk area today?", "I want to report an issue"];

const GREETING: DisplayMessage = {
  role: "assistant",
  content:
    "Hi — I'm the Karachi Pulse civic assistant. Ask me about risk in a specific area, current weather impact, or say you want to report an issue and I'll open the form for you.",
};

export function ChatWidget({
  areaStates,
  metrics,
  weather,
  open,
  onOpenChange,
  onFlyToArea,
  onOpenReportForm,
  onOpenAuthorities,
}: {
  areaStates: AreaState[];
  metrics: DashboardMetrics;
  weather: WeatherSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlyToArea: (areaId: string) => void;
  onOpenReportForm: (areaId?: string) => void;
  onOpenAuthorities: (category?: string) => void;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ configured: boolean; provider: string | null } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check provider config once when the panel is first opened — this is
  // what tells you at a glance whether CHAT_PROVIDER_API_KEY actually took
  // effect, instead of inferring it from reply wording.
  useEffect(() => {
    if (!open || status) return;
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ configured: false, provider: null }));
  }, [open, status]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  function executeActions(actions: ChatAction[]) {
    for (const action of actions) {
      if (action.type === "fly_to_area") onFlyToArea(action.areaId);
      else if (action.type === "open_report_form") onOpenReportForm(action.areaId);
      else if (action.type === "open_authorities") onOpenAuthorities(action.category);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextHistory: ChatTurn[] = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: trimmed },
    ];

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          context: { areaStates, metrics, weather },
        }),
      });
      const data: ChatResponse = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, actions: data.actions, degraded: data.degraded },
      ]);
      if (data.actions?.length) executeActions(data.actions);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't reach the assistant service just now — please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close civic assistant" : "Open civic assistant"}
        className="fixed bottom-5 right-5 z-[500] h-14 w-14 rounded-full bg-[var(--sand)] text-[#1a1206] shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex items-center justify-center hover:brightness-110 active:brightness-95 transition"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[500] w-[calc(100vw-2.5rem)] max-w-[380px] h-[min(560px,70vh)] kp-card flex flex-col overflow-hidden kp-fade-in shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-soft)] bg-[var(--panel-2)]">
            <span className="h-8 w-8 rounded-full bg-[var(--teal-soft)] flex items-center justify-center flex-shrink-0">
              <Sparkles size={15} className="text-[var(--teal)]" />
            </span>
            <div className="flex flex-col leading-tight flex-1">
              <span className="text-sm font-medium text-[var(--text)]">Civic Assistant</span>
              <span className="text-xs text-[var(--muted)]">Grounded in live Karachi Pulse data</span>
            </div>
            {status && (
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide rounded-full px-2 py-1 flex-shrink-0 ${
                  status.configured
                    ? "bg-[var(--risk-low-soft)] text-[var(--risk-low)]"
                    : "bg-[var(--risk-moderate-soft)] text-[var(--risk-moderate)]"
                }`}
                title={
                  status.configured
                    ? `Live AI replies via ${status.provider}`
                    : "No CHAT_PROVIDER_API_KEY set — answering from the local analysis engine"
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {status.configured ? status.provider : "Local engine"}
              </span>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto kp-scrollbar px-4 py-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <ChatMessageBubble key={i} role={m.role} content={m.content} actions={m.actions} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--panel-2)] border border-[var(--border-soft)] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-[var(--muted)] flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Reading live data…
                </div>
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div className="flex flex-col gap-2 mt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs text-[var(--muted)] border border-[var(--border-soft)] rounded-xl px-3 py-2 hover:border-[var(--teal)] hover:text-[var(--text)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 p-3 border-t border-[var(--border-soft)] bg-[var(--panel-2)]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an area, weather, or report an issue…"
              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none px-2 py-1.5"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-[var(--sand)] text-[#1a1206] disabled:opacity-40 flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

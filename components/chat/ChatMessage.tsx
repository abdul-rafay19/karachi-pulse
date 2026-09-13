import { MapPin, FileText, Building2 } from "lucide-react";
import { ChatAction } from "@/types";

const ACTION_META: Record<ChatAction["type"], { icon: typeof MapPin; label: (a: ChatAction) => string }> = {
  fly_to_area: {
    icon: MapPin,
    label: (a) => `Opened map → ${a.type === "fly_to_area" ? a.areaName : ""}`,
  },
  open_report_form: {
    icon: FileText,
    label: () => "Opened report form",
  },
  open_authorities: {
    icon: Building2,
    label: () => "Opened authority directory",
  },
};

export function ChatMessageBubble({
  role,
  content,
  actions,
}: {
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-[var(--sand)] text-[#1a1206] rounded-br-sm"
              : "bg-[var(--panel-2)] text-[var(--text)] border border-[var(--border-soft)] rounded-bl-sm"
          }`}
        >
          {content}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex flex-col gap-1">
            {actions.map((a, i) => {
              const meta = ACTION_META[a.type];
              const Icon = meta.icon;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--teal)] bg-[var(--teal-soft)] rounded-full px-2.5 py-1 w-fit"
                >
                  <Icon size={12} />
                  {meta.label(a)}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

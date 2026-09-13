import { ExternalLink } from "lucide-react";
import { Authority } from "@/types";

export function AuthorityCard({ authority }: { authority: Authority }) {
  return (
    <div className="kp-panel-2 rounded-[14px] p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Relevant authority</p>
      <p className="font-medium text-sm mb-1">{authority.name}</p>
      <p className="text-xs text-[var(--muted)] mb-3">{authority.description}</p>
      {authority.url ? (
        <a
          href={authority.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--teal)] hover:underline"
        >
          Report to authority
          <ExternalLink size={14} />
        </a>
      ) : (
        <span className="text-sm text-[var(--muted)]">{authority.channelLabel}</span>
      )}
      <p className="text-[10px] text-[var(--muted)] mt-3">
        Karachi Pulse does not submit reports on your behalf — this links to the {authority.channelLabel.toLowerCase()}.
      </p>
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import { AUTHORITIES } from "@/data/authorities";
import { CATEGORY_META, CATEGORY_OPTIONS } from "@/lib/ui/categoryMeta";

export function AuthorityDirectory() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CATEGORY_OPTIONS.map((cat) => {
        const authority = AUTHORITIES[cat];
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        return (
          <div key={cat} className="kp-card px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} style={{ color: meta.color }} />
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{meta.label}</p>
            </div>
            <p className="font-medium text-sm mb-1">{authority.name}</p>
            <p className="text-xs text-[var(--muted)] mb-3">{authority.description}</p>
            {authority.url && (
              <a
                href={authority.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--teal)] hover:underline"
              >
                {authority.channelLabel} <ExternalLink size={13} />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

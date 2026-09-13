import { CATEGORY_META, CATEGORY_OPTIONS } from "@/lib/ui/categoryMeta";
import { ComplaintCategory } from "@/types";

export function CategorySelector({
  value,
  onChange,
}: {
  value: ComplaintCategory;
  onChange: (c: ComplaintCategory) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Complaint category">
      {CATEGORY_OPTIONS.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const active = value === cat;
        return (
          <button
            key={cat}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(cat)}
            className={`flex flex-col items-center gap-1.5 rounded-[12px] border px-2 py-3 text-center transition-colors ${
              active
                ? "border-[var(--teal)] bg-[var(--teal-soft)]"
                : "border-[var(--border)] hover:border-[var(--muted)]"
            }`}
          >
            <Icon size={18} style={{ color: meta.color }} />
            <span className="text-[11px] leading-tight">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AREAS } from "@/data/areas";
import { CATEGORY_META, CATEGORY_OPTIONS } from "@/lib/ui/categoryMeta";
import { RISK_LEVEL_META } from "@/lib/ui/riskColors";
import { CategoryFilter, RiskFilter } from "@/types";

export function FiltersBar({
  categoryFilter,
  onCategoryChange,
  riskFilter,
  onRiskChange,
  onSearchSelect,
}: {
  categoryFilter: CategoryFilter;
  onCategoryChange: (v: CategoryFilter) => void;
  riskFilter: RiskFilter;
  onRiskChange: (v: RiskFilter) => void;
  onSearchSelect: (areaId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return AREAS.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full sm:w-72">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Search a Karachi area…"
          aria-label="Search area"
          className="w-full rounded-full bg-[var(--panel-2)] border border-[var(--border)] pl-9 pr-3 py-2 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--teal)]"
        />
        {focused && matches.length > 0 && (
          <div className="absolute z-20 mt-1.5 w-full kp-card overflow-hidden shadow-xl">
            {matches.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  onSearchSelect(a.id);
                  setQuery(a.name);
                }}
                className="w-full text-left px-3.5 py-2 text-sm hover:bg-[var(--panel-2)]"
              >
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={categoryFilter === "all"} onClick={() => onCategoryChange("all")}>
          All
        </FilterChip>
        {CATEGORY_OPTIONS.map((cat) => (
          <FilterChip key={cat} active={categoryFilter === cat} onClick={() => onCategoryChange(cat)}>
            {CATEGORY_META[cat].label}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={riskFilter === "all"} onClick={() => onRiskChange("all")}>
          All risk levels
        </FilterChip>
        {(["low", "moderate", "critical"] as const).map((level) => (
          <FilterChip
            key={level}
            active={riskFilter === level}
            onClick={() => onRiskChange(level)}
            dot={RISK_LEVEL_META[level].color}
          >
            {RISK_LEVEL_META[level].label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
        active
          ? "bg-[var(--sand)] text-[#1a1206] border-[var(--sand)]"
          : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
      }`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "#1a1206" : dot }} />}
      {children}
    </button>
  );
}

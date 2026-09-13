"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { AREAS } from "@/data/areas";
import { CategorySelector } from "./CategorySelector";
import { ComplaintProcessing, ComplaintSuccess } from "./ComplaintSuccess";
import { Button } from "@/components/ui/Button";
import { AIAnalysis, ComplaintCategory, Severity } from "@/types";
import { SubmitComplaintInput, SubmitComplaintOutcome } from "@/lib/state/useKarachiPulse";

type Stage = "form" | "processing" | "success";

const SEVERITIES: Severity[] = ["low", "moderate", "high", "critical"];

export function ComplaintForm({
  defaultAreaId,
  onSubmit,
  onFinished,
}: {
  defaultAreaId?: string | null;
  onSubmit: (input: SubmitComplaintInput) => Promise<SubmitComplaintOutcome>;
  onFinished: () => void;
}) {
  const [stage, setStage] = useState<Stage>("form");
  const [areaId, setAreaId] = useState(defaultAreaId || AREAS[0].id);
  const [category, setCategory] = useState<ComplaintCategory>("flooding");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ analysis?: AIAnalysis; degraded: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedArea = AREAS.find((a) => a.id === areaId) ?? AREAS[0];

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }
    setError(null);
    setStage("processing");

    const outcome = await onSubmit({
      areaId,
      category,
      description: description.trim(),
      userSeverity: severity,
      latitude: selectedArea.latitude,
      longitude: selectedArea.longitude,
      imageDataUrl: photo ?? undefined,
    });

    setResult({ analysis: outcome.complaint.aiAnalysis, degraded: outcome.degraded, message: outcome.message });
  }

  if (stage === "processing") {
    return <ComplaintProcessing onDone={() => setStage("success")} />;
  }

  if (stage === "success" && result) {
    return (
      <ComplaintSuccess
        analysis={result.analysis}
        degraded={result.degraded}
        message={result.message}
        onClose={onFinished}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-xs uppercase tracking-wide text-[var(--muted)] mb-2" htmlFor="area">
          Area
        </label>
        <select
          id="area"
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          className="w-full rounded-[10px] bg-[var(--panel-2)] border border-[var(--border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
        >
          {AREAS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Category</p>
        <CategorySelector value={category} onChange={setCategory} />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-[var(--muted)] mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Water has accumulated near the main road after yesterday's rain and vehicles are struggling to pass."
          className="w-full rounded-[10px] bg-[var(--panel-2)] border border-[var(--border)] px-3 py-2.5 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--teal)] resize-none"
        />
        {error && <p className="text-xs text-[var(--risk-critical)] mt-1.5">{error}</p>}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Severity</p>
        <div className="grid grid-cols-4 gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`rounded-[10px] border px-2 py-2 text-xs font-medium capitalize transition-colors ${
                severity === s
                  ? "border-[var(--teal)] bg-[var(--teal-soft)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-1.5">
          Karachi Pulse&apos;s AI will also independently estimate severity from your description.
        </p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Photo (optional)</p>
        {photo ? (
          <div className="relative w-28 h-28 rounded-[12px] overflow-hidden border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Uploaded preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
              aria-label="Remove photo"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-[10px] border border-dashed border-[var(--border)] px-3.5 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--muted)]"
          >
            <ImagePlus size={16} /> Add a photo
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>

      <Button type="submit" className="w-full mt-1">
        Analyze &amp; Report
      </Button>
    </form>
  );
}

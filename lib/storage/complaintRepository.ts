import { generateSeedComplaints } from "@/data/complaints";
import { Complaint } from "@/types";

const STORAGE_KEY = "karachi-pulse:complaints:v1";
const SEED_STAMP_KEY = "karachi-pulse:seed-stamp:v1";

// Re-seed if the stored data is older than this, so a demo left open across
// days doesn't go stale. Genuine citizen reports are preserved regardless.
const SEED_MAX_AGE_MS = 1000 * 60 * 60 * 12;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRaw(): Complaint[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Complaint[];
  } catch {
    return null;
  }
}

function writeRaw(complaints: Complaint[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    return true;
  } catch {
    return false;
  }
}

/**
 * ComplaintRepository — the only place in the app that knows data currently
 * lives in localStorage. Swapping this for a real API/database later means
 * rewriting this file only; the UI never touches localStorage directly.
 */
export const ComplaintRepository = {
  /** Loads seed data merged with any citizen-submitted reports. */
  getComplaints(): Complaint[] {
    if (!isBrowser()) return generateSeedComplaints();

    const stamp = window.localStorage.getItem(SEED_STAMP_KEY);
    const now = Date.now();
    const stampAge = stamp ? now - Number(stamp) : Infinity;

    const existing = readRaw();
    if (!existing || stampAge > SEED_MAX_AGE_MS) {
      const citizenReports = (existing ?? []).filter((c) => c.source === "citizen");
      const fresh = [...generateSeedComplaints(now), ...citizenReports];
      writeRaw(fresh);
      window.localStorage.setItem(SEED_STAMP_KEY, String(now));
      return fresh;
    }
    return existing;
  },

  addComplaint(complaint: Complaint): Complaint[] {
    const current = ComplaintRepository.getComplaints();
    const next = [...current, complaint];
    writeRaw(next);
    return next;
  },

  updateComplaint(id: string, patch: Partial<Complaint>): Complaint[] {
    const current = ComplaintRepository.getComplaints();
    const next = current.map((c) => (c.id === id ? { ...c, ...patch } : c));
    writeRaw(next);
    return next;
  },

  deleteComplaint(id: string): Complaint[] {
    const current = ComplaintRepository.getComplaints();
    const next = current.filter((c) => c.id !== id);
    writeRaw(next);
    return next;
  },

  /** Wipes everything and reseeds fresh demo data (used by the demo reset control). */
  clearComplaints(): Complaint[] {
    const now = Date.now();
    const fresh = generateSeedComplaints(now);
    writeRaw(fresh);
    if (isBrowser()) window.localStorage.setItem(SEED_STAMP_KEY, String(now));
    return fresh;
  },
};

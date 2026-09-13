import { Authority, ComplaintCategory } from "@/types";

// Category -> relevant civic channel. We never invent phone numbers or
// claim to have submitted anything on the citizen's behalf — Karachi Pulse
// points people to the official channel, it does not act as one.
export const AUTHORITIES: Record<ComplaintCategory, Authority> = {
  electricity: {
    category: "electricity",
    name: "K-Electric",
    description: "Handles power outages, tripping, exposed wiring and voltage complaints.",
    channelLabel: "Official complaint channel",
    url: "https://www.ke.com.pk/",
  },
  water: {
    category: "water",
    name: "Karachi Water & Sewerage Corporation (KWSC)",
    description: "Handles water supply shortages, contamination and pipeline faults.",
    channelLabel: "Official complaint channel",
    url: "https://kwsc.gos.pk/",
  },
  flooding: {
    category: "flooding",
    name: "KWSC / Karachi Metropolitan Corporation (KMC)",
    description: "Handles drainage capacity, stormwater channels and waterlogging on public roads.",
    channelLabel: "Official complaint channel",
    url: "https://kmc.gos.pk/",
  },
  sewage: {
    category: "sewage",
    name: "Karachi Water & Sewerage Corporation (KWSC)",
    description: "Handles sewage overflow, blocked lines and manhole faults.",
    channelLabel: "Official complaint channel",
    url: "https://kwsc.gos.pk/",
  },
  roads: {
    category: "roads",
    name: "Karachi Metropolitan Corporation (KMC)",
    description: "Handles potholes, road obstructions and public infrastructure damage.",
    channelLabel: "Official complaint channel",
    url: "https://kmc.gos.pk/",
  },
  waste: {
    category: "waste",
    name: "Sindh Solid Waste Management Board",
    description: "Handles garbage collection, dumping sites and sanitation complaints.",
    channelLabel: "Official complaint channel",
    url: "https://sswmb.gos.pk/",
  },
  other: {
    category: "other",
    name: "Karachi Metropolitan Corporation (KMC)",
    description: "General civic issues that don't fit a single utility department.",
    channelLabel: "Official complaint channel",
    url: "https://kmc.gos.pk/",
  },
};

export function getAuthorityFor(category: ComplaintCategory): Authority {
  return AUTHORITIES[category];
}

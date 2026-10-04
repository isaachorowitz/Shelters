/**
 * Colors the Leaflet map draws on canvas. Canvas cannot read CSS variables,
 * so these are literal values; each notes the token it mirrors in
 * styles/tokens.css. Change both together.
 */
export const MAP_COLORS = {
  /** Every shelter dot (--gs-brand). */
  shelter: "#DC2626",
  shelterEdge: "rgba(255,255,255,0.25)",
  /** The single nearest shelter. */
  nearest: "#FF1744",
  nearestEdge: "#FCD34D",
  /** Ranks 2–3 and 4–5 outlines. */
  top3Edge: "#ffffff",
  nearbyEdge: "#fbbf24",
  /** User dot and accuracy ring (--gs-info-strong). */
  user: "#3B82F6",
  /** Dashed lines to the five nearest shelters, nearest first. */
  routes: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"],
  /** Popup "Navigate" button and type label. */
  popupAction: "#DC2626",
  popupType: "#ef4444",
} as const

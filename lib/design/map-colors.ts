/**
 * Colors the Leaflet map draws on canvas. Canvas cannot read CSS variables,
 * so these are literal values; each notes the token it mirrors in
 * styles/tokens.css. Change both together.
 */
export const MAP_COLORS = {
  /** Every shelter dot (--gs-brand). */
  shelter: "#DC2626",
  /** Thin dark ring that separates dots from the dark tiles. */
  shelterEdge: "rgba(10,10,11,0.85)",
  /** The five nearest: same red with a white ring. */
  nearbyEdge: "#FAFAFA",
  /** The single nearest shelter (--gs-brand-bright) with a thick white ring. */
  nearest: "#EF4444",
  nearestEdge: "#FFFFFF",
  /** User dot and accuracy ring (--gs-info-strong). */
  user: "#3B82F6",
  /** Line to the nearest shelter (--gs-brand-bright). */
  routeNearest: "#EF4444",
  /** Dashed lines to shelters 2–5 (--gs-fg at low opacity). */
  routeOther: "#FAFAFA",
} as const

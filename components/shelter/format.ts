/** Distance split for display: { value: "64", unit: "m" } or { value: "1.4", unit: "km" }. */
export function formatDistanceParts(meters: number): { value: string; unit: string } {
  if (meters < 1000) return { value: String(Math.round(meters)), unit: "m" }
  if (meters < 100_000) return { value: (meters / 1000).toFixed(1), unit: "km" }
  return { value: Math.round(meters / 1000).toLocaleString(), unit: "km" }
}

/** Distance as one string: "64 m", "1.4 km". */
export function formatDistance(meters: number): string {
  const { value, unit } = formatDistanceParts(meters)
  return `${value} ${unit}`
}

/** ETA as one string: "4 min", "1.5 hr". */
export function formatEta(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = minutes / 60
  if (hours > 99) return ">99 hr"
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} hr`
}

/** Distance for a shelter card: "85m", "1.2km", "1,240km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  if (meters < 100_000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.round(meters / 1000).toLocaleString()}km`
}

/** Short distance for the sheet summary: "85m", "1.2km". */
export function formatDistanceShort(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`
}

/** ETA split into value and unit for the travel buttons. */
export function formatEtaParts(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(Math.round(minutes)), unit: "min" }
  const hours = minutes / 60
  if (hours > 99) return { value: ">99", unit: "hr" }
  return { value: hours < 10 ? hours.toFixed(1) : String(Math.round(hours)), unit: "hr" }
}

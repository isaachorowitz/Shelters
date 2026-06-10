import type { Shelter } from "./types"
import { SHELTER_TYPES } from "./types"

export interface ShelterDisplayInfo {
  /** The most useful locator text (address, meaningful name, or coordinates) */
  primaryLine: string
  /** Supporting context (neighborhood + city, or name if address is primary) */
  secondaryLine?: string
  /** Meaningful shelter name if different from primary line */
  meaningfulName?: string
  /** Bilingual type label */
  typeLabel: string
}

/** Patterns that indicate a shelter name is just a generic identifier, not a useful landmark */
const GENERIC_NAME_PATTERNS = [
  /^\d+(\.\d+)?$/, // bare numbers like "690.0" or "30"
  /^מקלט\s*(ציבורי\s*)?מספר\s*[\u200B]?\d+/, // "מקלט ציבורי מספר 626"
  /^מקלט\s*#?\d+$/, // "מקלט #123"
  /^מקלט\s*–\s*/, // generated fallback names from API "מקלט – ..."
  /^Public Shelter\s*[–-]/, // generated english fallback
  /^\.\d+/, // ".2003 בית משותף..."  — internal codes
  /^[\d.]+\s+בית משותף/, // "2003 בית משותף" — internal building codes
]

function isMeaningfulName(name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length < 2) return false
  return !GENERIC_NAME_PATTERNS.some((p) => p.test(trimmed))
}

export function getShelterDisplayInfo(shelter: Shelter): ShelterDisplayInfo {
  const typeInfo = SHELTER_TYPES[shelter.type]
  const typeLabel = typeInfo ? `${typeInfo.he} / ${typeInfo.en}` : shelter.type

  const hasMeaningful = shelter.name ? isMeaningfulName(shelter.name) : false

  // Build location context line
  const contextParts: string[] = []
  if (shelter.neighborhood) contextParts.push(shelter.neighborhood)
  if (shelter.cityHe) contextParts.push(shelter.cityHe)
  else if (shelter.cityEn) contextParts.push(shelter.cityEn)
  const contextLine = contextParts.length > 0 ? contextParts.join(", ") : undefined

  // Priority 1: Has address — address is primary
  if (shelter.address) {
    return {
      primaryLine: shelter.address,
      secondaryLine: contextLine,
      meaningfulName: hasMeaningful ? shelter.name : undefined,
      typeLabel,
    }
  }

  // Priority 2: Meaningful name (landmark, building name, etc.)
  if (hasMeaningful) {
    return {
      primaryLine: shelter.name!,
      secondaryLine: contextLine,
      typeLabel,
    }
  }

  // Priority 3: Has city
  if (shelter.cityHe || shelter.cityEn) {
    return {
      primaryLine: shelter.cityHe ?? shelter.cityEn!,
      secondaryLine: shelter.neighborhood ?? undefined,
      typeLabel,
    }
  }

  // Priority 4: Coordinates only fallback
  return {
    primaryLine: `${shelter.coordinates.lat.toFixed(4)}, ${shelter.coordinates.lng.toFixed(4)}`,
    typeLabel,
  }
}

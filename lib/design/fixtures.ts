import type { Shelter } from "@/lib/types"
import { calculateEtas } from "@/lib/utils"

/** Sample shelters for the component catalog (/kit) and design previews. */
function shelter(id: string, distance: number, rest: Partial<Shelter>): Shelter {
  return {
    id,
    type: "public_shelter",
    coordinates: { lat: 32.0853, lng: 34.7818 },
    distance,
    etas: calculateEtas(distance),
    ...rest,
  }
}

export const SAMPLE_SHELTERS: Shelter[] = [
  shelter("s1", 64, {
    type: "underground_parking",
    address: "דיזנגוף 50, תל אביב",
    neighborhood: "לב העיר",
    cityHe: "תל אביב",
    capacity: 240,
    confidence: "high",
  }),
  shelter("s2", 168, {
    type: "public_shelter",
    address: "Ben Yehuda 112",
    cityHe: "תל אביב",
    capacity: 80,
    confidence: "medium",
  }),
  shelter("s3", 412, {
    type: "school",
    name: "בית ספר בלפור",
    neighborhood: "הצפון הישן",
    cityHe: "תל אביב",
    confidence: "low",
  }),
  shelter("s4", 1350, { type: "fortified_space", address: "Ibn Gabirol 124", cityHe: "תל אביב" }),
  shelter("s5", 2800, { type: "distributed", cityHe: "תל אביב", neighborhood: "יפו" }),
]

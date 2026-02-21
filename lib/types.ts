export interface Coordinates {
  lat: number
  lng: number
}

export interface Shelter {
  id: string
  name: string
  type: string
  coordinates: Coordinates
  distance?: number // in meters
  address?: string
  neighborhood?: string
  cityEn?: string
  cityHe?: string
  capacity?: number
  sources?: string
  etas?: {
    run: number // in minutes
    walk: number // in minutes
    cycle: number // in minutes
    scooter: number // in minutes
  }
}

/** Shape returned by the /api/shelters endpoint */
export interface ShelterApiResponse {
  id: number
  name: string
  type: string
  lat: number
  lng: number
  meters: number
  address?: string
  neighborhood?: string
  city_en?: string
  city_he?: string
  capacity?: number
  sources?: string
}

/**
 * Bilingual shelter type labels.
 * Keys match the normalized type values in the data.
 */
export const SHELTER_TYPES: Record<string, { en: string; he: string }> = {
  public_shelter: { en: "Public Shelter", he: "מקלט ציבורי" },
  bomb_shelter: { en: "Bomb Shelter", he: "מקלט" },
  underground_parking: { en: "Underground Parking", he: "חניון תת-קרקעי" },
  school: { en: "School Shelter", he: "מקלט בית ספר" },
  distributed: { en: "Distributed Shelter", he: "מקלט מבוזר" },
  fortified_space: { en: "Fortified Space", he: "מיגונית" },
  reinforced_shelter: { en: "Reinforced Shelter", he: "מחסה" },
  kindergarten: { en: "Kindergarten Shelter", he: "מקלט גני ילדים" },
  carmelit_station: { en: "Carmelit Station", he: "תחנת כרמלית" },
  building: { en: "Building Shelter", he: "מקלט מבנה" },
}

/** Shape returned by the /api/shelters/directory endpoint */
export interface DirectoryShelterEntry {
  id: number
  lat: number
  lng: number
  type: string
  name?: string
  address?: string
  neighborhood?: string
  city_en?: string
  city_he?: string
  capacity?: number
  sources?: string
}

export interface NeighborhoodGroup {
  name: string
  count: number
  shelters: DirectoryShelterEntry[]
}

export interface CityGroup {
  cityHe: string
  cityEn: string
  count: number
  neighborhoods: NeighborhoodGroup[]
  shelters: DirectoryShelterEntry[] // shelters in this city without a neighborhood
}

export interface RegionGroup {
  nameHe: string
  nameEn: string
  count: number
  shelters: DirectoryShelterEntry[]
}

export interface DirectoryResponse {
  cities: CityGroup[]
  unknownRegions: RegionGroup[]
  totalCount: number
}

/** Source labels for the data attribution section */
export const DATA_SOURCES: {
  key: string
  name: string
  nameHe: string
  description: string
  type: "government" | "ngo" | "community" | "opensource"
}[] = [
  {
    key: "jerusalem_ckan_2025",
    name: "Jerusalem Municipality",
    nameHe: "עיריית ירושלים",
    description: "Open data portal (jerusalem.datacity.org.il), June 2025 update",
    type: "government",
  },
  {
    key: "jerusalem_datacity_2025",
    name: "Jerusalem Municipality (DataCity)",
    nameHe: "עיריית ירושלים",
    description: "DataCity open data platform",
    type: "government",
  },
  {
    key: "jerusalem_github_2024",
    name: "Jerusalem Public Shelters (GitHub)",
    nameHe: "מקלטי ירושלים",
    description: "Aggregated from ODbL-licensed municipal sources by Daniel Rosehill",
    type: "opensource",
  },
  {
    key: "beer_sheva_govil",
    name: "Beer Sheva Municipality",
    nameHe: "עיריית באר שבע",
    description: "Official dataset on Israel's national open data portal (data.gov.il)",
    type: "government",
  },
  {
    key: "haifa_datacity",
    name: "Haifa Municipality",
    nameHe: "עיריית חיפה",
    description: "Open data portal (haifa.datacity.org.il) - 273 protection locations",
    type: "government",
  },
  {
    key: "haifa_pdf",
    name: "Haifa Municipality (PDF)",
    nameHe: "עיריית חיפה",
    description: "Official published list of 101 public shelters with accessibility info",
    type: "government",
  },
  {
    key: "miklat_finder_d4g",
    name: "Data for Good Israel",
    nameHe: "דאטה לטובה",
    description: "Nationwide shelter map by Arthur Krigel & Jeremy Atia (2,084 shelters)",
    type: "ngo",
  },
  {
    key: "negev_bimkom",
    name: "Bimkom / Negev Research Lab",
    nameHe: "במקום / מעבדת הנגב",
    description: "613 built shelters in the Negev, sourced from Bimkom NGO field surveys",
    type: "ngo",
  },
  {
    key: "openstreetmap",
    name: "OpenStreetMap",
    nameHe: "אופן סטריט מאפ",
    description: "764 bomb shelters mapped by the OSM community across Israel",
    type: "community",
  },
  {
    key: "tlv_mymaps",
    name: "TLV Shelters Community Map",
    nameHe: "מפת מקלטי תל אביב",
    description: "Community-contributed map with 314 Tel Aviv shelters",
    type: "community",
  },
]

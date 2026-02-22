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
export interface DataSource {
  key: string
  name: string
  nameHe: string
  description: string
  type: "government" | "ngo" | "community" | "opensource"
  url?: string
  count?: number
  lastUpdated?: string
}

export const DATA_SOURCES: DataSource[] = [
  {
    key: "jerusalem_ckan_2025",
    name: "Jerusalem Municipality",
    nameHe: "עיריית ירושלים",
    description: "Open data portal, June 2025 update",
    type: "government",
    url: "https://jerusalem.datacity.org.il",
    count: 412,
    lastUpdated: "2025-06",
  },
  {
    key: "jerusalem_datacity_2025",
    name: "Jerusalem Municipality (DataCity)",
    nameHe: "עיריית ירושלים",
    description: "DataCity open data platform",
    type: "government",
    url: "https://jerusalem.datacity.org.il",
    count: 186,
    lastUpdated: "2025-06",
  },
  {
    key: "jerusalem_github_2024",
    name: "Jerusalem Public Shelters (GitHub)",
    nameHe: "מקלטי ירושלים",
    description: "Aggregated from ODbL-licensed municipal sources by Daniel Rosehill",
    type: "opensource",
    url: "https://github.com/danielrosehill/Jerusalem-Public-Shelters",
    count: 98,
    lastUpdated: "2024-10",
  },
  {
    key: "beer_sheva_govil",
    name: "Beer Sheva Municipality",
    nameHe: "עיריית באר שבע",
    description: "Official dataset on Israel's national open data portal (data.gov.il)",
    type: "government",
    url: "https://data.gov.il",
    count: 156,
    lastUpdated: "2024-12",
  },
  {
    key: "haifa_datacity",
    name: "Haifa Municipality",
    nameHe: "עיריית חיפה",
    description: "Open data portal - protection locations",
    type: "government",
    url: "https://haifa.datacity.org.il",
    count: 273,
    lastUpdated: "2025-01",
  },
  {
    key: "haifa_pdf",
    name: "Haifa Municipality (PDF)",
    nameHe: "עיריית חיפה",
    description: "Official published list of public shelters with accessibility info",
    type: "government",
    url: "https://haifa.muni.il",
    count: 101,
    lastUpdated: "2024-08",
  },
  {
    key: "miklat_finder_d4g",
    name: "Data for Good Israel",
    nameHe: "דאטה לטובה",
    description: "Nationwide shelter map by Arthur Krigel & Jeremy Atia",
    type: "ngo",
    url: "https://miklat.info",
    count: 2084,
    lastUpdated: "2024-11",
  },
  {
    key: "negev_bimkom",
    name: "Bimkom / Negev Research Lab",
    nameHe: "במקום / מעבדת הנגב",
    description: "Built shelters in the Negev, sourced from Bimkom NGO field surveys",
    type: "ngo",
    url: "https://bimkom.org",
    count: 613,
    lastUpdated: "2024-06",
  },
  {
    key: "openstreetmap",
    name: "OpenStreetMap",
    nameHe: "אופן סטריט מאפ",
    description: "Bomb shelters mapped by the OSM community across Israel",
    type: "community",
    url: "https://www.openstreetmap.org",
    count: 764,
    lastUpdated: "2025-02",
  },
  {
    key: "tlv_mymaps",
    name: "TLV Shelters Community Map",
    nameHe: "מפת מקלטי תל אביב",
    description: "Community-contributed map of Tel Aviv shelters",
    type: "community",
    count: 314,
    lastUpdated: "2024-09",
  },
]

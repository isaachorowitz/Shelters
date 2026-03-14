export interface Coordinates {
  lat: number
  lng: number
}

export interface Shelter {
  id: number
  lat: number
  lng: number
  type: ShelterType
  name?: string
  address?: string
  neighborhood?: string
  city_en?: string
  city_he?: string
  capacity?: number
  sources?: string
  confidence?: "high" | "medium" | "low"
}

export type ShelterType =
  | "public_shelter"
  | "bomb_shelter"
  | "underground_parking"
  | "school"
  | "distributed"
  | "fortified_space"
  | "reinforced_shelter"
  | "kindergarten"
  | "carmelit_station"
  | "building"

export interface ShelterFilters {
  type?: ShelterType | "all"
  city?: string
  hasName?: boolean
  hasAddress?: boolean
  searchQuery?: string
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface NearestShelterResult {
  shelter: Shelter
  distanceKm: number
  walkingMinutes: number
}

export interface ShelterStats {
  total: number
  byType: Record<ShelterType, number>
  byCity: Record<string, number>
  withCoords: number
  withAddress: number
  withName: number
}

// Data source metadata
export interface DataSource {
  id: string
  name: string
  nameHe?: string
  description: string
  url: string
  lastUpdated: string
  recordCount?: number
  type?: "government" | "ngo" | "community" | "commercial"
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: "miklat_info",
    name: "Data for Good Israel (miklat.info)",
    description: "Crowdsourced national shelter database",
    url: "https://miklat.info",
    lastUpdated: "2026-01",
    recordCount: 2084,
    type: "community",
  },
  {
    id: "jerusalem_ckan",
    name: "Jerusalem Municipality (CKAN)",
    description: "Official Jerusalem shelter data",
    url: "https://jerusalem.datacity.org.il",
    lastUpdated: "2025-09",
    recordCount: 412,
    type: "government",
  },
  {
    id: "jerusalem_datacity",
    name: "Jerusalem DataCity",
    description: "Jerusalem open data portal",
    url: "https://jerusalem.datacity.org.il",
    lastUpdated: "2025-09",
    recordCount: 186,
    type: "government",
  },
  {
    id: "jerusalem_github",
    name: "Jerusalem Shelters (GitHub)",
    description: "Community-curated Jerusalem shelter list",
    url: "https://github.com/danielrosehill/Jerusalem-Public-Shelters",
    lastUpdated: "2025-09",
    recordCount: 98,
    type: "community",
  },
  {
    id: "beer_sheva_govil",
    name: "Beer Sheva (data.gov.il)",
    description: "Official Beer Sheva shelter registry",
    url: "https://data.gov.il/dataset/shelters-br7",
    lastUpdated: "2026-03",
    recordCount: 156,
    type: "government",
  },
  {
    id: "haifa_datacity",
    name: "Haifa DataCity",
    description: "Haifa open data shelter registry",
    url: "https://haifa.datacity.org.il",
    lastUpdated: "2025-11",
    recordCount: 273,
    type: "government",
  },
  {
    id: "haifa_pdf",
    name: "Haifa Accessibility Survey",
    description: "Haifa shelter accessibility audit",
    url: "https://haifa.muni.il",
    lastUpdated: "2025-06",
    recordCount: 101,
    type: "government",
  },
  {
    id: "bimkom_negev",
    name: "Bimkom / Negev Research Lab",
    description: "Negev region shelter survey",
    url: "https://bimkom.org",
    lastUpdated: "2025-08",
    recordCount: 613,
    type: "ngo",
  },
  {
    id: "osm",
    name: "OpenStreetMap",
    description: "Community-mapped shelters (bomb_shelter, bunker, underground parking)",
    url: "https://www.openstreetmap.org",
    lastUpdated: "2026-03",
    recordCount: 764,
    type: "community",
  },
  {
    id: "tlv_community",
    name: "TLV Shelters Community Map",
    description: "Crowdsourced Tel Aviv shelter map",
    url: "https://www.google.com/maps/d/",
    lastUpdated: "2025-12",
    recordCount: 314,
    type: "community",
  },
  {
    id: "osm_extended",
    name: "OpenStreetMap Extended (fetch-osm-shelters.ts)",
    description: "Additional OSM shelters via Overpass API",
    url: "https://overpass-api.de",
    lastUpdated: "2026-03",
    type: "community",
  },
  {
    id: "google_places",
    name: "Google Places API",
    description: "Underground parking garages from Google Places",
    url: "https://places.googleapis.com/v1/places:searchNearby",
    lastUpdated: "2026-03",
    type: "commercial",
  },
  {
    id: "arcgis_municipal",
    name: "ArcGIS Municipal Datasets",
    description: "Municipal shelter layers from ArcGIS open data portals across Israel",
    url: "https://www.arcgis.com/home/group.html?id=2a6c43e3a66946958f14934b61a84c83",
    lastUpdated: "2026-02",
    recordCount: 1842,
    type: "government",
  },
  {
    id: "huggingface",
    name: "HuggingFace Shelter Dataset",
    description: "Aggregated Israeli shelter dataset on HuggingFace Hub",
    url: "https://huggingface.co/datasets",
    lastUpdated: "2026-01",
    recordCount: 734,
    type: "community",
  },
]

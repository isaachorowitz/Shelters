/**
 * Fetches shelter datasets from data.gov.il (Israel's national open data portal)
 * and municipal open data portals (DataCity platforms).
 *
 * Known datasets:
 *  - Beer Sheva shelters (data.gov.il) — already integrated
 *  - Jerusalem (jerusalem.datacity.org.il) — already integrated
 *  - Haifa (haifa.datacity.org.il) — already integrated
 *  - Tel Aviv (opendata.tel-aviv.gov.il) — check for new datasets
 *
 * This script checks for UPDATES to existing datasets and searches for
 * NEW municipal datasets that may have been published.
 *
 * Run: npx tsx scripts/fetch-gov-data.ts
 * Output: data/gov-data-audit.json
 */

import * as fs from "fs"
import * as path from "path"

const OUTPUT_PATH = path.join(__dirname, "..", "data", "gov-data-audit.json")

interface DatasetInfo {
  source: string
  name: string
  url: string
  last_modified?: string
  record_count?: number
  format?: string
  status: "active" | "new" | "updated" | "unavailable"
  notes?: string
}

interface CkanResource {
  id: string
  name: string
  format: string
  url: string
  last_modified: string
  datastore_active: boolean
}

interface CkanResult {
  title: string
  name: string
  metadata_modified: string
  resources: CkanResource[]
  organization: { title: string }
}

// Search data.gov.il for shelter-related datasets
async function searchDataGovIl(): Promise<DatasetInfo[]> {
  const results: DatasetInfo[] = []
  const searchTerms = ["shelter", "מקלטים", "מקלט", "מיגון", "חירום", "bunker"]

  for (const term of searchTerms) {
    try {
      const res = await fetch(
        `https://data.gov.il/api/3/action/package_search?q=${encodeURIComponent(term)}&rows=50`
      )
      if (!res.ok) continue

      const data = await res.json()
      const datasets: CkanResult[] = data?.result?.results ?? []

      for (const ds of datasets) {
        const geoResources = ds.resources.filter(
          (r) =>
            r.format?.toLowerCase() === "geojson" ||
            r.format?.toLowerCase() === "json" ||
            r.format?.toLowerCase() === "csv" ||
            r.format?.toLowerCase() === "xlsx"
        )

        results.push({
          source: "data.gov.il",
          name: `${ds.title} (${ds.organization?.title ?? "unknown"})`,
          url: `https://data.gov.il/dataset/${ds.name}`,
          last_modified: ds.metadata_modified,
          record_count: geoResources.length,
          format: geoResources.map((r) => r.format).join(", "),
          status: "active",
          notes: `${geoResources.length} downloadable resources`,
        })
      }
    } catch (e) {
      console.warn(`  Warning: data.gov.il search for "${term}" failed: ${e}`)
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  return results.filter((r) => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
}

// Check DataCity portals for shelter data
async function checkDataCityPortal(
  baseUrl: string,
  cityName: string
): Promise<DatasetInfo[]> {
  const results: DatasetInfo[] = []

  // DataCity portals use CKAN API
  const searchTerms = ["מקלט", "shelter", "מיגון", "חירום"]

  for (const term of searchTerms) {
    try {
      const res = await fetch(
        `${baseUrl}/api/3/action/package_search?q=${encodeURIComponent(term)}&rows=20`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!res.ok) continue

      const data = await res.json()
      const datasets: CkanResult[] = data?.result?.results ?? []

      for (const ds of datasets) {
        results.push({
          source: `${cityName} DataCity`,
          name: ds.title,
          url: `${baseUrl}/dataset/${ds.name}`,
          last_modified: ds.metadata_modified,
          status: "active",
          notes: `${ds.resources?.length ?? 0} resources`,
        })
      }
    } catch {
      // Portal may be down or rate-limited
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  return results.filter((r) => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
}

// Check Tel Aviv open data specifically
async function checkTelAvivOpenData(): Promise<DatasetInfo[]> {
  try {
    const res = await fetch("https://opendata.tel-aviv.gov.il/en/", {
      signal: AbortSignal.timeout(10000),
    })
    return [{
      source: "Tel Aviv Open Data",
      name: "Tel Aviv Open Data Portal",
      url: "https://opendata.tel-aviv.gov.il",
      status: res.ok ? "active" : "unavailable",
      notes: res.ok
        ? "Portal is active — check manually for shelter datasets. Search: מקלט, חירום"
        : "Portal returned error. Check manually.",
    }]
  } catch {
    return [{
      source: "Tel Aviv Open Data",
      name: "Tel Aviv Open Data Portal",
      url: "https://opendata.tel-aviv.gov.il",
      status: "unavailable",
      notes: "Portal is currently unavailable",
    }]
  }
}

async function main() {
  console.log("Auditing government shelter data sources...\n")

  // 1. Search data.gov.il
  console.log("Searching data.gov.il...")
  const govResults = await searchDataGovIl()
  console.log(`  Found ${govResults.length} datasets`)

  // 2. Check DataCity portals
  const dataCityPortals = [
    { url: "https://jerusalem.datacity.org.il", city: "Jerusalem" },
    { url: "https://haifa.datacity.org.il", city: "Haifa" },
  ]

  const dataCityResults: DatasetInfo[] = []
  for (const portal of dataCityPortals) {
    console.log(`Checking ${portal.city} DataCity portal...`)
    const results = await checkDataCityPortal(portal.url, portal.city)
    dataCityResults.push(...results)
    console.log(`  Found ${results.length} datasets`)
  }

  // 3. Check Tel Aviv
  console.log("Checking Tel Aviv open data portal...")
  const tlvResults = await checkTelAvivOpenData()
  console.log(`  Status: ${tlvResults[0]?.status}`)

  // Combine all results
  const allResults = [...govResults, ...dataCityResults, ...tlvResults]

  // Add known sources that are already integrated (for completeness)
  const knownSources: DatasetInfo[] = [
    {
      source: "Already integrated",
      name: "Jerusalem CKAN 2025",
      url: "https://jerusalem.datacity.org.il",
      status: "active",
      notes: "412 shelters in current dataset",
    },
    {
      source: "Already integrated",
      name: "Jerusalem DataCity 2025",
      url: "https://jerusalem.datacity.org.il",
      status: "active",
      notes: "186 shelters in current dataset",
    },
    {
      source: "Already integrated",
      name: "Jerusalem GitHub (Daniel Rosehill)",
      url: "https://github.com/danielrosehill/Jerusalem-Public-Shelters",
      status: "active",
      notes: "98 shelters in current dataset",
    },
    {
      source: "Already integrated",
      name: "Beer Sheva (data.gov.il)",
      url: "https://data.gov.il/dataset/shelters-br7",
      status: "active",
      notes: "156 shelters — last updated March 2026",
    },
    {
      source: "Already integrated",
      name: "Haifa DataCity",
      url: "https://haifa.datacity.org.il",
      status: "active",
      notes: "273 shelters in current dataset",
    },
    {
      source: "Already integrated",
      name: "Haifa PDF",
      url: "https://haifa.muni.il",
      status: "active",
      notes: "101 shelters from accessibility survey",
    },
    {
      source: "Already integrated",
      name: "Data for Good Israel (miklat.info)",
      url: "https://miklat.info",
      status: "active",
      notes: "2,084 shelters nationwide — largest single source",
    },
    {
      source: "Already integrated",
      name: "Bimkom / Negev Research Lab",
      url: "https://bimkom.org",
      status: "active",
      notes: "613 shelters in Negev region",
    },
    {
      source: "Already integrated",
      name: "OpenStreetMap",
      url: "https://www.openstreetmap.org",
      status: "active",
      notes: "764 shelters from OSM community",
    },
    {
      source: "Already integrated",
      name: "TLV Shelters Community Map",
      url: "https://www.google.com/maps/d/",
      status: "active",
      notes: "314 Tel Aviv shelters",
    },
  ]

  const audit = {
    timestamp: new Date().toISOString(),
    newOrUpdatedDatasets: allResults,
    alreadyIntegrated: knownSources,
    recommendations: [
      "Beer Sheva dataset on data.gov.il was last updated March 2026 — check for new records",
      "Tel Aviv Open Data portal should be checked manually for shelter datasets",
      "Check Daniel Rosehill GitHub for September 2025 update with ~800 Jerusalem shelters on HuggingFace",
      "Pikud HaOref (Home Front Command) may have an internal database — no public API known",
      "Rishon LeZion, Petah Tikva, Netanya, Ashdod have very few shelters — check their municipal sites",
    ],
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(audit, null, 2))
  console.log(`\nAudit results saved to: ${OUTPUT_PATH}`)
  console.log(`\nRecommendations:`)
  for (const rec of audit.recommendations) {
    console.log(`  • ${rec}`)
  }
}

main().catch(console.error)

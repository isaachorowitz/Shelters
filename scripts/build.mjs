import { spawnSync } from "node:child_process"

if (!process.env.NEXT_PUBLIC_CARTO_BASEMAP_API_KEY?.trim()) {
  console.error("NEXT_PUBLIC_CARTO_BASEMAP_API_KEY is required to build the map. Check the Shelters secrets in Infisical.")
  process.exit(1)
}

const result = spawnSync("next", ["build"], { stdio: "inherit" })
if (result.error) {
  console.error("Could not start the Next.js build.")
}
process.exit(result.status ?? 1)

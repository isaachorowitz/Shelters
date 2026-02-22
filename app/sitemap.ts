import type { MetadataRoute } from "next"
import shelterData from "@/data/shelters.json"

interface ShelterEntry {
  city_en?: string
  city_he?: string
}

// Generate city slugs from shelter data for dynamic city pages
function getCitySlugs(): string[] {
  const cities = new Set<string>()
  for (const s of shelterData as ShelterEntry[]) {
    if (s.city_en) {
      cities.add(s.city_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""))
    }
  }
  return Array.from(cities).sort()
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://getshelter.app"
  const citySlugs = getCitySlugs()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/safety-guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const cityPages: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${baseUrl}/shelters/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...cityPages]
}

import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Shield } from "lucide-react"
import shelterData from "@/data/shelters.json"

interface ShelterEntry {
  city_en?: string
  city_he?: string
}

export const metadata: Metadata = {
  title: "Bomb Shelter Directory — All Cities in Israel",
  description:
    "Browse bomb shelter locations by city across Israel. Find public shelters in Jerusalem, Tel Aviv, Haifa, Beer Sheva and 12+ more cities. מדריך מקלטים לפי עיר.",
  alternates: { canonical: "/shelters" },
  keywords: [
    "bomb shelter directory Israel",
    "shelters by city Israel",
    "מדריך מקלטים",
    "מקלטים לפי עיר",
    "Israel shelter map",
  ],
}

function getCities() {
  const map = new Map<
    string,
    { slug: string; cityEn: string; cityHe: string; count: number }
  >()
  for (const s of shelterData as ShelterEntry[]) {
    if (!s.city_en) continue
    const slug = s.city_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "")
    if (!map.has(slug)) {
      map.set(slug, { slug, cityEn: s.city_en, cityHe: s.city_he || "", count: 0 })
    }
    map.get(slug)!.count++
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

export default function SheltersDirectoryPage() {
  const cities = getCities()
  const totalShelters = cities.reduce((sum, c) => sum + c.count, 0)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-brand-soft" aria-hidden="true" />
          <span className="text-sm text-brand-soft font-semibold">Shelter Directory</span>
        </div>
        <h1 className="text-3xl font-black mb-1">Bomb Shelters in Israel</h1>
        <p className="text-fg/50 text-sm">
          {totalShelters.toLocaleString()} verified shelters across {cities.length} cities
        </p>
      </div>

      {/* Find nearest CTA */}
      <div className="bg-brand-deep/30 border border-brand-bright/20 rounded-xl p-4 mb-8">
        <p className="text-sm text-fg/70 mb-2">
          In an emergency, use the live shelter finder to get GPS directions to the nearest shelter instantly.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-strong text-fg font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Shield className="h-4 w-4" aria-hidden="true" />
          Find Nearest Shelter Now
        </Link>
      </div>

      {/* City grid */}
      <h2 className="text-lg font-bold text-fg mb-4">Browse by City / לפי עיר</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/shelters/${city.slug}`}
            className="group bg-fg/3 hover:bg-fg/6 border border-fg/6 hover:border-brand-bright/20 rounded-xl px-4 py-3 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-fg group-hover:text-brand-softer transition-colors truncate">
                  {city.cityEn}
                </p>
                {city.cityHe && (
                  <p className="text-xs text-fg/35 mt-0.5" dir="rtl">
                    {city.cityHe}
                  </p>
                )}
              </div>
              <span className="text-xs font-bold text-fg/30 bg-fg/5 px-2 py-0.5 rounded-full flex-shrink-0">
                {city.count.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* SEO text */}
      <section className="mt-10 bg-fg/3 border border-fg/5 rounded-xl p-5">
        <h2 className="text-sm font-bold text-fg/40 mb-2">About This Directory</h2>
        <p className="text-xs text-fg/30 leading-relaxed">
          Get Shelter maintains a database of {totalShelters.toLocaleString()} verified public bomb shelters and
          protected spaces across Israel. Data is sourced from municipal open data portals, NGO surveys, and
          community mapping projects. Use the{" "}
          <Link href="/" className="text-brand-soft underline">
            live shelter finder
          </Link>{" "}
          for real-time GPS navigation to the nearest shelter during an emergency. Always follow Home Front
          Command (פיקוד העורף) instructions. Call 104 in an emergency.
        </p>
      </section>
    </main>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-brand-bright" aria-hidden="true" />
          <span className="text-eyebrow font-semibold uppercase tracking-wider text-brand-soft">Shelter Directory</span>
        </div>
        <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg">Bomb Shelters in Israel</h1>
        <p className="text-body text-fg-muted mt-3">
          {totalShelters.toLocaleString()} verified shelters across {cities.length} cities
        </p>
      </div>

      {/* Find nearest CTA */}
      <div className="rounded-2xl bg-surface-2 border border-line p-5 mb-10">
        <p className="text-body text-fg-muted mb-4">
          In an emergency, use the live shelter finder to get GPS directions to the nearest shelter instantly.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link href="/">
            <Shield className="h-4 w-4" aria-hidden="true" />
            Find Nearest Shelter Now
          </Link>
        </Button>
      </div>

      {/* City grid */}
      <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">Browse by City / לפי עיר</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/shelters/${city.slug}`}
            className="group rounded-2xl bg-surface-2 border border-line p-5 hover:border-line-strong hover:bg-surface-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-body font-semibold text-fg truncate">
                  {city.cityEn}
                </p>
                {city.cityHe && (
                  <p className="text-label text-fg-subtle mt-0.5" dir="rtl">
                    {city.cityHe}
                  </p>
                )}
              </div>
              <Chip tone="neutral" size="sm" className="flex-shrink-0">
                {city.count.toLocaleString()}
              </Chip>
            </div>
          </Link>
        ))}
      </div>

      {/* SEO text */}
      <section className="mt-12 rounded-2xl bg-surface-2 border border-line p-5">
        <h2 className="text-body font-semibold text-fg mb-2">About This Directory</h2>
        <p className="text-label text-fg-muted leading-relaxed">
          Get Shelter maintains a database of {totalShelters.toLocaleString()} verified public bomb shelters and
          protected spaces across Israel. Data is sourced from municipal open data portals, NGO surveys, and
          community mapping projects. Use the{" "}
          <Link href="/" className="text-info hover:underline underline-offset-4">
            live shelter finder
          </Link>{" "}
          for real-time GPS navigation to the nearest shelter during an emergency. Always follow Home Front
          Command (פיקוד העורף) instructions. Call 104 in an emergency.
        </p>
      </section>
    </main>
  )
}

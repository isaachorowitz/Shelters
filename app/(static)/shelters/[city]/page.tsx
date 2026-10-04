import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Shield, MapPin, Navigation, Users, Phone } from "lucide-react"
import { notFound } from "next/navigation"
import shelterData from "@/data/shelters.json"
import { SHELTER_TYPES } from "@/lib/types"

interface ShelterEntry {
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

const SHELTERS = shelterData as ShelterEntry[]

function getCityData(slug: string) {
  const cityShelters = SHELTERS.filter((s) => {
    if (!s.city_en) return false
    const citySlug = s.city_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")
    return citySlug === slug
  })

  if (cityShelters.length === 0) return null

  const cityEn = cityShelters[0].city_en!
  const cityHe = cityShelters[0].city_he || ""

  const neighborhoodMap = new Map<string, ShelterEntry[]>()
  const noNeighborhood: ShelterEntry[] = []
  for (const s of cityShelters) {
    if (s.neighborhood) {
      if (!neighborhoodMap.has(s.neighborhood)) neighborhoodMap.set(s.neighborhood, [])
      neighborhoodMap.get(s.neighborhood)!.push(s)
    } else {
      noNeighborhood.push(s)
    }
  }

  const neighborhoods = Array.from(neighborhoodMap.entries())
    .map(([name, shelters]) => ({ name, shelters, count: shelters.length }))
    .sort((a, b) => b.count - a.count)

  const typeCounts = new Map<string, number>()
  for (const s of cityShelters) {
    typeCounts.set(s.type, (typeCounts.get(s.type) || 0) + 1)
  }

  return {
    cityEn,
    cityHe,
    slug,
    shelters: cityShelters,
    neighborhoods,
    ungrouped: noNeighborhood,
    typeCounts: Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count, label: SHELTER_TYPES[type]?.en || type }))
      .sort((a, b) => b.count - a.count),
    totalCount: cityShelters.length,
  }
}

export async function generateStaticParams() {
  const slugs = new Set<string>()
  for (const s of SHELTERS) {
    if (s.city_en) {
      slugs.add(s.city_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""))
    }
  }
  return Array.from(slugs).map((city) => ({ city }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city: slug } = await params
  const data = getCityData(slug)
  if (!data) return { title: "City Not Found - Get Shelter" }

  const title = `Bomb Shelters in ${data.cityEn} ${data.cityHe ? `(${data.cityHe})` : ""} - Get Shelter`
  const description = `Find ${data.totalCount} bomb shelters in ${data.cityEn}, Israel. Complete list of public shelters, reinforced rooms, and protected spaces. מקלטים ב${data.cityHe || data.cityEn}.`

  return {
    title,
    description,
    keywords: [
      `bomb shelters ${data.cityEn}`,
      `shelters in ${data.cityEn}`,
      `מקלטים ב${data.cityHe || data.cityEn}`,
      `${data.cityEn} bomb shelter map`,
      `מפת מקלטים ${data.cityHe || data.cityEn}`,
      "bomb shelter Israel",
      "מקלט ציבורי",
    ],
    alternates: { canonical: `/shelters/${slug}` },
    openGraph: { title, description, type: "website" },
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city: slug } = await params
  const data = getCityData(slug)
  if (!data) notFound()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-brand-bright" />
          <span className="text-eyebrow font-semibold uppercase tracking-wider text-brand-soft">
            <Link href="/shelters" className="hover:text-brand-bright transition-colors">Shelter Directory</Link>
            {" / "}
            {data.cityEn}
          </span>
        </div>
        <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg">Bomb Shelters in {data.cityEn}</h1>
        {data.cityHe && (
          <p className="text-heading font-semibold text-fg-muted mt-1" dir="rtl">מקלטים ב{data.cityHe}</p>
        )}
        <p className="text-body text-fg-muted mt-3">
          {data.totalCount} shelters across {data.neighborhoods.length} neighborhoods
        </p>
      </div>

      {/* Quick CTA */}
      <div className="rounded-2xl bg-surface-2 border border-line p-5 mb-10">
        <p className="text-body text-fg-muted mb-4">
          Need to find the nearest shelter right now? Get Shelter uses your GPS to show the closest shelters instantly.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link href="/">
            <Shield className="h-4 w-4" />
            Open Shelter Finder
          </Link>
        </Button>
      </div>

      {/* Type breakdown */}
      <section className="mb-10">
        <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">Shelter Types in {data.cityEn}</h2>
        <div className="flex flex-wrap gap-2">
          {data.typeCounts.map((tc) => (
            <Chip key={tc.type} tone="outline" size="md">
              {tc.label}: <span className="text-fg font-semibold">{tc.count}</span>
            </Chip>
          ))}
        </div>
      </section>

      {/* Neighborhoods */}
      {data.neighborhoods.length > 0 && (
        <section className="mb-10">
          <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">Shelters by Neighborhood / מקלטים לפי שכונה</h2>
          <div className="space-y-3">
            {data.neighborhoods.map((n) => (
              <details key={n.name} className="group rounded-2xl bg-surface-2 border border-line overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-3 transition-colors">
                  <span className="text-body font-semibold text-fg" dir="auto">{n.name}</span>
                  <Chip tone="neutral" size="sm">{n.count} shelters</Chip>
                </summary>
                <div className="px-4 pb-4 space-y-2 border-t border-line pt-3">
                  {n.shelters.map((s) => (
                    <ShelterRow key={s.id} shelter={s} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Ungrouped shelters */}
      {data.ungrouped.length > 0 && (
        <section className="mb-10">
          <h2 className="text-body font-semibold text-fg-muted mb-3">Other Shelters ({data.ungrouped.length})</h2>
          <div className="space-y-2">
            {data.ungrouped.map((s) => (
              <ShelterRow key={s.id} shelter={s} />
            ))}
          </div>
        </section>
      )}

      {/* Emergency numbers */}
      <section className="mb-10">
        <h2 className="text-heading font-semibold text-fg tracking-tight mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4 text-brand-bright" />
          Emergency Numbers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { number: "100", label: "Police", color: "text-info bg-info/10 border-info/20" },
            { number: "101", label: "MDA", color: "text-brand-soft bg-brand/10 border-brand/20" },
            { number: "102", label: "Fire", color: "text-warn bg-warn/10 border-warn/20" },
            { number: "104", label: "Home Front", color: "text-live bg-live/10 border-live/20" },
          ].map((item) => (
            <a key={item.number} href={`tel:${item.number}`} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-label font-semibold ${item.color}`}>
              <Phone className="h-3.5 w-3.5" />
              {item.number} {item.label}
            </a>
          ))}
        </div>
      </section>

      {/* SEO text */}
      <section className="rounded-2xl bg-surface-2 border border-line p-5 mb-10">
        <h2 className="text-body font-semibold text-fg mb-2">About Bomb Shelters in {data.cityEn}</h2>
        <p className="text-label text-fg-muted leading-relaxed">
          This page lists all {data.totalCount} known public bomb shelters and protected spaces in{" "}
          {data.cityEn} ({data.cityHe}), Israel. Data is sourced from official municipal open data
          portals, NGO field surveys, and community mapping projects. Shelter locations may change
          — always verify in person during an emergency. For the most up-to-date shelter information,
          use the{" "}
          <Link href="/" className="text-info hover:underline underline-offset-4">Get Shelter app</Link>{" "}
          which shows your nearest shelter based on GPS location. In an emergency, follow Home
          Front Command instructions by calling 104.
        </p>
      </section>

      {/* Footer links */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-label text-fg-subtle">
        <Link href="/shelters" className="hover:text-fg-muted underline underline-offset-4">All Cities</Link>
        <Link href="/about" className="hover:text-fg-muted underline underline-offset-4">About</Link>
        <Link href="/safety-guide" className="hover:text-fg-muted underline underline-offset-4">Safety Guide</Link>
        <Link href="/terms" className="hover:text-fg-muted underline underline-offset-4">Terms</Link>
        <Link href="/privacy" className="hover:text-fg-muted underline underline-offset-4">Privacy</Link>
        <Link href="/contact" className="hover:text-fg-muted underline underline-offset-4">Contact</Link>
        <Link href="/donate" className="hover:text-fg-muted underline underline-offset-4">Donate</Link>
      </div>
    </main>
  )
}

function ShelterRow({ shelter }: { shelter: ShelterEntry }) {
  const typeInfo = SHELTER_TYPES[shelter.type]
  const typeLabel = typeInfo ? typeInfo.en : shelter.type
  const displayName = shelter.address || shelter.name || `Shelter #${shelter.id}`

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-2 border border-line">
      <div className="w-1.5 h-1.5 rounded-full bg-brand-bright flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-label font-semibold text-fg truncate" dir="auto">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-caption text-brand-soft">{typeLabel}</span>
          {shelter.capacity != null && shelter.capacity > 0 && (
            <>
              <span className="text-fg-subtle text-caption">&middot;</span>
              <span className="text-caption text-fg-subtle flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                {shelter.capacity}
              </span>
            </>
          )}
        </div>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-caption font-semibold text-info bg-info/10 border border-info/20 hover:bg-info/15 transition-colors flex-shrink-0"
      >
        <Navigation className="h-3 w-3" />
        Navigate
      </a>
    </div>
  )
}

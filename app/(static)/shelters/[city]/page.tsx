import type { Metadata } from "next"
import Link from "next/link"
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
    <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-red-400" />
          <span className="text-sm text-red-400 font-semibold">
            <Link href="/shelters" className="hover:text-red-300 transition-colors">Shelter Directory</Link>
            {" / "}
            {data.cityEn}
          </span>
        </div>
        <h1 className="text-3xl font-black mb-1">Bomb Shelters in {data.cityEn}</h1>
        {data.cityHe && (
          <p className="text-xl text-white/50 font-bold" dir="rtl">מקלטים ב{data.cityHe}</p>
        )}
        <p className="text-sm text-white/40 mt-2">
          {data.totalCount} shelters across {data.neighborhoods.length} neighborhoods
        </p>
      </div>

      {/* Quick CTA */}
      <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 mb-8">
        <p className="text-sm text-white/70 mb-2">
          Need to find the nearest shelter right now? Get Shelter uses your GPS to show the closest shelters instantly.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Shield className="h-4 w-4" />
          Open Shelter Finder
        </Link>
      </div>

      {/* Type breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3">Shelter Types in {data.cityEn}</h2>
        <div className="flex flex-wrap gap-2">
          {data.typeCounts.map((tc) => (
            <span key={tc.type} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-white/60">
              {tc.label}: <span className="text-white font-bold">{tc.count}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Neighborhoods */}
      {data.neighborhoods.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Shelters by Neighborhood / מקלטים לפי שכונה</h2>
          <div className="space-y-3">
            {data.neighborhoods.map((n) => (
              <details key={n.name} className="group bg-white/3 border border-white/6 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors">
                  <span className="text-sm font-bold text-white" dir="auto">{n.name}</span>
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{n.count} shelters</span>
                </summary>
                <div className="px-4 pb-3 space-y-1.5 border-t border-white/5 pt-2">
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
        <section className="mb-8">
          <h2 className="text-sm font-bold text-white/50 mb-3">Other Shelters ({data.ungrouped.length})</h2>
          <div className="space-y-1.5">
            {data.ungrouped.map((s) => (
              <ShelterRow key={s.id} shelter={s} />
            ))}
          </div>
        </section>
      )}

      {/* Emergency numbers */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Phone className="h-4 w-4 text-red-400" />
          Emergency Numbers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { number: "100", label: "Police", color: "text-blue-400 bg-blue-500/10 border-blue-500/15" },
            { number: "101", label: "MDA", color: "text-red-400 bg-red-500/10 border-red-500/15" },
            { number: "102", label: "Fire", color: "text-orange-400 bg-orange-500/10 border-orange-500/15" },
            { number: "104", label: "Home Front", color: "text-green-400 bg-green-500/10 border-green-500/15" },
          ].map((item) => (
            <a key={item.number} href={`tel:${item.number}`} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${item.color}`}>
              <Phone className="h-3 w-3" />
              {item.number} {item.label}
            </a>
          ))}
        </div>
      </section>

      {/* SEO text */}
      <section className="bg-white/3 border border-white/5 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-bold text-white/40 mb-2">About Bomb Shelters in {data.cityEn}</h2>
        <p className="text-xs text-white/30 leading-relaxed">
          This page lists all {data.totalCount} known public bomb shelters and protected spaces in{" "}
          {data.cityEn} ({data.cityHe}), Israel. Data is sourced from official municipal open data
          portals, NGO field surveys, and community mapping projects. Shelter locations may change
          — always verify in person during an emergency. For the most up-to-date shelter information,
          use the{" "}
          <Link href="/" className="text-red-400 underline">Get Shelter app</Link>{" "}
          which shows your nearest shelter based on GPS location. In an emergency, follow Home
          Front Command instructions by calling 104.
        </p>
      </section>

      {/* Footer links */}
      <div className="flex flex-wrap gap-4 text-xs text-white/25">
        <Link href="/shelters" className="hover:text-white/50 underline">All Cities</Link>
        <Link href="/about" className="hover:text-white/50 underline">About</Link>
        <Link href="/safety-guide" className="hover:text-white/50 underline">Safety Guide</Link>
        <Link href="/terms" className="hover:text-white/50 underline">Terms</Link>
        <Link href="/privacy" className="hover:text-white/50 underline">Privacy</Link>
        <Link href="/contact" className="hover:text-white/50 underline">Contact</Link>
        <Link href="/donate" className="hover:text-white/50 underline">Donate</Link>
      </div>
    </main>
  )
}

function ShelterRow({ shelter }: { shelter: ShelterEntry }) {
  const typeInfo = SHELTER_TYPES[shelter.type]
  const typeLabel = typeInfo ? typeInfo.en : shelter.type
  const displayName = shelter.address || shelter.name || `Shelter #${shelter.id}`

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/2 border border-white/4">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate" dir="auto">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-red-400/50">{typeLabel}</span>
          {shelter.capacity != null && shelter.capacity > 0 && (
            <>
              <span className="text-white/15 text-[10px]">&middot;</span>
              <span className="text-[10px] text-white/25 flex items-center gap-0.5">
                <Users className="h-2.5 w-2.5" />
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
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/15 hover:bg-blue-500/20 transition-colors flex-shrink-0"
      >
        <Navigation className="h-2.5 w-2.5" />
        Navigate
      </a>
    </div>
  )
}

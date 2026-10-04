import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Heart, Building2, Users, Code2, Phone } from "lucide-react"
import { DATA_SOURCES } from "@/lib/types"

export const metadata: Metadata = {
  title: "About - Get Shelter | Emergency Bomb Shelter Locator for Israel",
  description:
    "Get Shelter is a free, open-source emergency shelter locator helping people in Israel find the nearest bomb shelter in seconds. Built with open data from 10+ verified sources.",
  alternates: { canonical: "/about" },
}

const TYPE_ICONS = {
  government: Building2,
  ngo: Heart,
  community: Users,
  opensource: Code2,
}

const TYPE_COLORS = {
  government: "text-info",
  ngo: "text-pink-400",
  community: "text-live",
  opensource: "text-warn",
}

export default function AboutPage() {
  const grouped = {
    government: DATA_SOURCES.filter((s) => s.type === "government"),
    ngo: DATA_SOURCES.filter((s) => s.type === "ngo"),
    community: DATA_SOURCES.filter((s) => s.type === "community"),
    opensource: DATA_SOURCES.filter((s) => s.type === "opensource"),
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/30">
          <Shield className="h-8 w-8 text-fg" />
        </div>
        <h1 className="text-3xl font-black mb-2">Get Shelter</h1>
        <p className="text-lg text-fg/60">Emergency Bomb Shelter Locator for Israel</p>
        <p className="text-lg text-fg/60" dir="rtl">איתור מקלטים בזמן אמת בישראל</p>
      </div>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-fg/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-fg">Our Mission</h2>
          <p>
            When a siren goes off, every second counts. Get Shelter helps people in Israel find the
            nearest bomb shelter instantly — whether you&apos;re a resident, a tourist, or a new immigrant
            unfamiliar with your surroundings.
          </p>
          <p>
            The app uses your GPS location to show the closest shelters on a map, with estimated
            travel times by foot, running, bike, and scooter. One tap opens navigation in Google
            Maps, Apple Maps, or Waze.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">How It Works</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { step: "1", title: "Open the app", desc: "Your location is detected automatically" },
              { step: "2", title: "See nearest shelters", desc: "Ranked by distance with travel times" },
              { step: "3", title: "Tap to navigate", desc: "Opens your preferred maps app" },
              { step: "4", title: "Get to safety", desc: "Follow directions to the nearest shelter" },
            ].map((item) => (
              <div key={item.step} className="bg-fg/5 rounded-xl p-4 border border-fg/5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-xs font-black">
                    {item.step}
                  </span>
                  <span className="font-bold text-fg text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-fg/50 pl-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">Data Sources</h2>
          <p>
            Get Shelter aggregates data from <strong>{DATA_SOURCES.length} verified open sources</strong>{" "}
            across Israel. Our database currently contains <strong>2,939 shelter locations</strong>.
          </p>
          <div className="space-y-4 mt-4">
            {(Object.entries(grouped) as [keyof typeof TYPE_ICONS, typeof DATA_SOURCES][]).map(
              ([type, sources]) =>
                sources.length > 0 && (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = TYPE_ICONS[type]
                        return <Icon className={`h-4 w-4 ${TYPE_COLORS[type]}`} />
                      })()}
                      <h3 className={`text-sm font-bold ${TYPE_COLORS[type]}`}>
                        {type === "government" ? "Government Sources" : type === "ngo" ? "NGO Sources" : type === "community" ? "Community Sources" : "Open Source"}
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {sources.map((source) => (
                        <div key={source.id} className="bg-fg/4 rounded-lg px-3 py-2 border border-fg/5">
                          <p className="text-sm font-semibold text-fg">
                            {source.name}
                            <span className="text-fg/30 mx-1.5">/</span>
                            <span className="text-fg/50" dir="rtl">{source.nameHe}</span>
                          </p>
                          <p className="text-xs text-fg/40 mt-0.5">{source.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">Emergency Numbers / מספרי חירום</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { number: "100", label: "Police / משטרה", color: "bg-info-strong/15 border-info-strong/20 text-info" },
              { number: "101", label: "MDA Ambulance / מד\"א", color: "bg-brand-bright/15 border-brand-bright/20 text-brand-soft" },
              { number: "102", label: "Fire Dept / כיבוי אש", color: "bg-orange-500/15 border-orange-500/20 text-orange-400" },
              { number: "104", label: "Home Front / פיקוד העורף", color: "bg-live-strong/15 border-live-strong/20 text-live" },
            ].map((item) => (
              <a key={item.number} href={`tel:${item.number}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.color} transition-opacity hover:opacity-80`}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <div>
                  <span className="text-lg font-black">{item.number}</span>
                  <p className="text-tiny opacity-70">{item.label}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">Privacy & Trust</h2>
          <div className="bg-green-950/30 border border-live-strong/20 rounded-xl p-4">
            <ul className="space-y-2 text-sm">
              {["No personal data collected — ever", "No cookies, no tracking, no analytics", "Location data stays on your device", "100% free, no ads, no premium features", "Open data from verified sources"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-live mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">Support the Project</h2>
          <p>
            Get Shelter is a free community project. If you&apos;d like to help keep it running, consider{" "}
            <Link href="/donate" className="text-brand-soft hover:text-brand-softer underline">making a donation</Link>.
            Every contribution goes directly toward hosting costs, data verification, and development.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">Contact</h2>
          <p>Have questions, found incorrect data, or want to help?</p>
          <p>Email:{" "}
            <a href="mailto:donate@getshelter.app" className="text-brand-soft hover:text-brand-softer underline">donate@getshelter.app</a>
          </p>
        </section>

        <section className="flex gap-4 text-xs text-fg/30">
          <Link href="/terms" className="hover:text-fg/60 underline">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-fg/60 underline">Privacy Policy</Link>
          <Link href="/safety-guide" className="hover:text-fg/60 underline">Safety Guide</Link>
        </section>
      </div>
    </main>
  )
}

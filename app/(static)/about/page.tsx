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
  ngo: "text-brand-soft",
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
      <div className="text-center mb-14">
        <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mx-auto mb-5">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg mb-3">Get Shelter</h1>
        <p className="text-body text-fg-muted">Emergency Bomb Shelter Locator for Israel</p>
        <p className="text-body text-fg-muted" dir="rtl">איתור מקלטים בזמן אמת בישראל</p>
      </div>

      <div className="space-y-10 text-body text-fg-muted leading-relaxed [&_section]:space-y-4 [&_strong]:text-fg [&_strong]:font-semibold">
        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">Our Mission</h2>
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
          <h2 className="text-heading font-semibold text-fg tracking-tight">How It Works</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { step: "1", title: "Open the app", desc: "Your location is detected automatically" },
              { step: "2", title: "See nearest shelters", desc: "Ranked by distance with travel times" },
              { step: "3", title: "Tap to navigate", desc: "Opens your preferred maps app" },
              { step: "4", title: "Get to safety", desc: "Follow directions to the nearest shelter" },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl bg-surface-2 border border-line p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-full bg-brand/15 text-brand-soft text-label font-semibold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </span>
                  <span className="font-semibold text-fg text-body">{item.title}</span>
                </div>
                <p className="text-label text-fg-muted pl-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">Data Sources</h2>
          <p>
            Get Shelter aggregates data from <strong>{DATA_SOURCES.length} verified open sources</strong>{" "}
            across Israel. Our database currently contains <strong>2,939 shelter locations</strong>.
          </p>
          <div className="space-y-6 mt-4">
            {(Object.entries(grouped) as [keyof typeof TYPE_ICONS, typeof DATA_SOURCES][]).map(
              ([type, sources]) =>
                sources.length > 0 && (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = TYPE_ICONS[type]
                        return <Icon className={`h-4 w-4 ${TYPE_COLORS[type]}`} />
                      })()}
                      <h3 className={`text-label font-semibold ${TYPE_COLORS[type]}`}>
                        {type === "government" ? "Government Sources" : type === "ngo" ? "NGO Sources" : type === "community" ? "Community Sources" : "Open Source"}
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {sources.map((source) => (
                        <div key={source.id} className="rounded-xl bg-surface-2 border border-line px-4 py-3">
                          <p className="text-label font-semibold text-fg">
                            {source.name}
                            <span className="text-fg-subtle mx-1.5">/</span>
                            <span className="text-fg-muted" dir="rtl">{source.nameHe}</span>
                          </p>
                          <p className="text-caption text-fg-subtle mt-0.5">{source.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">Emergency Numbers / מספרי חירום</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { number: "100", label: "Police / משטרה", color: "bg-info/10 border-info/20 text-info" },
              { number: "101", label: "MDA Ambulance / מד\"א", color: "bg-brand/10 border-brand/20 text-brand-soft" },
              { number: "102", label: "Fire Dept / כיבוי אש", color: "bg-warn/10 border-warn/20 text-warn" },
              { number: "104", label: "Home Front / פיקוד העורף", color: "bg-live/10 border-live/20 text-live" },
            ].map((item) => (
              <a key={item.number} href={`tel:${item.number}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.color} transition-opacity hover:opacity-80`}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <div>
                  <span className="text-title font-bold">{item.number}</span>
                  <p className="text-caption opacity-80">{item.label}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">Privacy & Trust</h2>
          <div className="rounded-2xl border border-live/25 bg-live/8 p-5">
            <ul className="space-y-2.5 text-body">
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
          <h2 className="text-heading font-semibold text-fg tracking-tight">Support the Project</h2>
          <p>
            Get Shelter is a free community project. If you&apos;d like to help keep it running, consider{" "}
            <Link href="/donate" className="text-info hover:underline underline-offset-4">making a donation</Link>.
            Every contribution goes directly toward hosting costs, data verification, and development.
          </p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">Contact</h2>
          <p>Have questions, found incorrect data, or want to help?</p>
          <p>Email:{" "}
            <a href="mailto:donate@getshelter.app" className="text-info hover:underline underline-offset-4">donate@getshelter.app</a>
          </p>
        </section>

        <section className="flex flex-wrap gap-x-5 gap-y-2 text-label text-fg-subtle">
          <Link href="/terms" className="hover:text-fg-muted underline underline-offset-4">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-fg-muted underline underline-offset-4">Privacy Policy</Link>
          <Link href="/safety-guide" className="hover:text-fg-muted underline underline-offset-4">Safety Guide</Link>
        </section>
      </div>
    </main>
  )
}

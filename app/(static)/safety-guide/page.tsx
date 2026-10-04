import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Clock, Phone, AlertTriangle, CheckCircle2, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Safety Guide - What To Do During a Siren in Israel | Get Shelter",
  description:
    "Complete safety guide for sirens in Israel. How much time you have to reach a shelter, what to do during a rocket attack, and how to stay safe. מה עושים באזעקה.",
  keywords: [
    "what to do during siren Israel",
    "מה עושים באזעקה",
    "כמה זמן יש להיכנס למקלט",
    "how much time to reach shelter Israel",
    "rocket attack Israel safety",
    "bomb shelter rules Israel",
    "shelter safety instructions",
    "pikud haoref instructions",
    "הנחיות פיקוד העורף",
  ],
  alternates: { canonical: "/safety-guide" },
}

const TIME_ZONES = [
  { region: "Gaza border communities", regionHe: "עוטף עזה", time: "15 seconds", timeHe: "15 שניות", color: "bg-brand", urgency: "Immediate" },
  { region: "Sderot, Ashkelon", regionHe: "שדרות, אשקלון", time: "30 seconds", timeHe: "30 שניות", color: "bg-brand-bright", urgency: "Critical" },
  { region: "Ashdod, Be'er Sheva", regionHe: "אשדוד, באר שבע", time: "45-60 seconds", timeHe: "45-60 שניות", color: "bg-warn-strong", urgency: "Urgent" },
  { region: "Tel Aviv, Central Israel", regionHe: "תל אביב, מרכז", time: "90 seconds", timeHe: "90 שניות", color: "bg-warn", urgency: "Alert" },
  { region: "Haifa, North", regionHe: "חיפה, צפון", time: "60-90 seconds", timeHe: "60-90 שניות", color: "bg-warn", urgency: "Alert" },
  { region: "Jerusalem", regionHe: "ירושלים", time: "90 seconds", timeHe: "90 שניות", color: "bg-warn", urgency: "Alert" },
  { region: "Northern border", regionHe: "גבול הצפון", time: "Up to 3 minutes", timeHe: "עד 3 דקות", color: "bg-live", urgency: "Standard" },
]

export default function SafetyGuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mb-5">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg">Safety Guide</h1>
        <p className="text-body text-fg-muted mt-3">What to do when a siren sounds / מה עושים באזעקה</p>
      </div>

      <div className="rounded-2xl border border-brand/25 bg-brand/8 p-4 mb-10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-brand-bright mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-brand-soft text-body">Always follow official Home Front Command (פיקוד העורף) instructions.</p>
            <p className="text-label text-fg-muted mt-1">
              Call <a href="tel:104" className="text-info underline underline-offset-4 font-semibold">104</a> for official emergency instructions. This guide is for general information only.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight mb-1 flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-bright" />
            Time to Reach Shelter by Region
          </h2>
          <p className="text-body text-fg-muted mb-4" dir="rtl">זמן הגעה למקלט לפי אזור</p>
          <div className="space-y-2">
            {TIME_ZONES.map((zone) => (
              <div key={zone.region} className="flex items-center gap-3 rounded-2xl bg-surface-2 border border-line px-4 py-3">
                <div className={`w-2 h-8 rounded-full ${zone.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-body font-semibold text-fg">{zone.region}</p>
                  <p className="text-caption text-fg-subtle" dir="rtl">{zone.regionHe}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-body font-semibold text-fg">{zone.time}</p>
                  <p className="text-caption text-fg-subtle" dir="rtl">{zone.timeHe}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">When You Hear a Siren / כשנשמעת אזעקה</h2>
          <div className="space-y-3">
            {[
              { step: "1", title: "Enter a shelter or protected space immediately", titleHe: "היכנסו למקלט או למרחב מוגן מיד", desc: "A bomb shelter, stairwell (not top or bottom floor), or an interior room with minimal windows." },
              { step: "2", title: "Close doors and windows", titleHe: "סגרו דלתות וחלונות", desc: "If in a sealed room (חדר אטום), seal the door and window with wet towels and tape if chemical threat is indicated." },
              { step: "3", title: "Stay away from windows and outer walls", titleHe: "התרחקו מחלונות וקירות חיצוניים", desc: "Position yourself against an inner wall. Protect your head." },
              { step: "4", title: "Wait 10 minutes after the last explosion", titleHe: "המתינו 10 דקות מהפיצוץ האחרון", desc: "Do not leave the shelter until 10 minutes after the last sound of impact or until cleared by authorities." },
              { step: "5", title: "Follow official instructions", titleHe: "פעלו לפי הנחיות פיקוד העורף", desc: "Listen to official radio/TV/app announcements for the all-clear signal." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 rounded-2xl bg-surface-2 border border-line p-5">
                <span className="w-7 h-7 rounded-full bg-brand/15 text-brand-soft text-label font-semibold flex items-center justify-center flex-shrink-0">{item.step}</span>
                <div>
                  <p className="text-body font-semibold text-fg">{item.title}</p>
                  <p className="text-label text-fg-subtle mt-0.5" dir="rtl">{item.titleHe}</p>
                  <p className="text-label text-fg-muted mt-1.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">If No Shelter Is Available / אם אין מקלט זמין</h2>
          <div className="space-y-3">
            {[
              { situation: "Outdoors", situationHe: "בשטח פתוח", action: "Lie flat on the ground, face down. Cover your head with your hands. Stay away from buildings and vehicles." },
              { situation: "In a building without a shelter", situationHe: "בבניין ללא מקלט", action: "Go to the stairwell (not the top or bottom floor). Position yourself against an inner wall, away from windows." },
              { situation: "In a vehicle", situationHe: "ברכב", action: "Stop the vehicle safely. Exit and lie flat on the ground away from the vehicle. If you cannot exit, bend below window level." },
              { situation: "In a high-rise building", situationHe: "בבניין רב קומות", action: "Go to the stairwell on your floor or 2 floors below. Do not use the elevator. Do not go to the roof." },
            ].map((item) => (
              <div key={item.situation} className="rounded-2xl border border-warn/25 bg-warn/8 p-5">
                <p className="text-body font-semibold text-warn">{item.situation}</p>
                <p className="text-label text-warn" dir="rtl">{item.situationHe}</p>
                <p className="text-label text-fg-muted mt-1.5">{item.action}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">Prepare in Advance / הכנה מראש</h2>
          <div className="space-y-3">
            {[
              "Know where your nearest shelter is BEFORE an emergency",
              "Practice the route from your home, work, and school to the nearest shelter",
              "Keep a flashlight, water, and phone charger in your shelter",
              "Save Get Shelter to your phone's home screen for quick access",
              "Share shelter locations with family members and friends",
              "Keep your phone charged — you'll need navigation in an emergency",
              "Download offline maps of your area in Google Maps or Waze",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-live mt-0.5 flex-shrink-0" />
                <span className="text-body text-fg-muted">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-brand-bright" />
            Emergency Numbers / מספרי חירום
          </h2>
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
          <div className="rounded-2xl bg-surface-2 border border-line p-6 sm:p-8 text-center">
            <MapPin className="h-6 w-6 text-brand-bright mx-auto mb-3" />
            <h3 className="text-title font-semibold text-fg mb-1">Find Your Nearest Shelter Now</h3>
            <p className="text-body text-fg-muted mb-5">Don&apos;t wait for an emergency. Know your nearest shelter today.</p>
            <Button asChild variant="primary" size="lg">
              <Link href="/">
                <Shield className="h-4 w-4" />
                Open Get Shelter
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

import type { Metadata } from "next"
import { Shield, Heart, Server, Database, Code2, CheckCircle2, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Donate - Support Get Shelter | Emergency Shelter Locator",
  description:
    "Support Get Shelter, the free emergency bomb shelter locator for Israel. Your donation helps keep the service running and save lives.",
  alternates: { canonical: "/donate" },
}

export default function DonatePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/30">
          <Heart className="h-8 w-8 text-fg" />
        </div>
        <h1 className="text-3xl font-black mb-2">Support Get Shelter</h1>
        <p className="text-lg text-fg/60 max-w-lg mx-auto">
          Help us keep this life-saving service free and available for everyone in Israel.
        </p>
        <p className="text-lg text-fg/50 mt-1" dir="rtl">עזרו לנו לשמור על השירות הזה בחינם ונגיש לכולם</p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-fg mb-4">Where Your Donation Goes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Server, title: "Hosting & Infrastructure", desc: "Servers that handle thousands of simultaneous requests during sirens", color: "text-info", bg: "bg-info-strong/10 border-info-strong/15" },
            { icon: Database, title: "Data Verification", desc: "On-the-ground verification of shelter locations, accessibility, and status", color: "text-live", bg: "bg-live-strong/10 border-live-strong/15" },
            { icon: Code2, title: "Development", desc: "New features like offline mode, push notifications, and real-time alerts", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/15" },
            { icon: Shield, title: "Data Expansion", desc: "Adding more shelter data from municipalities across Israel", color: "text-warn", bg: "bg-warn-muted/10 border-warn-muted/15" },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl p-4 border ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
              <h3 className="text-sm font-bold text-fg">{item.title}</h3>
              <p className="text-xs text-fg/50 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="bg-gradient-to-b from-brand-deep/40 to-brand-deep/20 border border-brand-bright/20 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-black text-fg mb-2">Make a Donation</h2>
          <p className="text-sm text-fg/60 mb-6 max-w-md mx-auto">
            Every contribution, no matter the size, helps us maintain and improve the service.
            100% of donations go toward the project.
          </p>
          <div className="bg-fg/5 rounded-xl p-5 max-w-sm mx-auto border border-fg/10">
            <Mail className="h-6 w-6 text-brand-soft mx-auto mb-3" />
            <p className="text-sm font-bold text-fg mb-1">Contact us to donate</p>
            <a
              href="mailto:donate@getshelter.app?subject=Get%20Shelter%20Donation"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-strong text-fg font-bold px-6 py-3 rounded-xl text-sm transition-colors mt-2"
            >
              <Heart className="h-4 w-4" />
              donate@getshelter.app
            </a>
            <p className="text-xs text-fg/30 mt-3">
              We&apos;ll respond with payment options including PayPal, bank transfer, and more.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { amount: "₪18", label: "Chai", sublabel: "חי" },
              { amount: "₪50", label: "Supporter", sublabel: "תומך" },
              { amount: "₪100", label: "Guardian", sublabel: "שומר" },
              { amount: "₪360", label: "Protector", sublabel: "מגן" },
            ].map((tier) => (
              <div key={tier.amount} className="bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <span className="text-lg font-black text-fg">{tier.amount}</span>
                <p className="text-tiny text-fg/40 font-semibold">{tier.label}</p>
                <p className="text-tiny text-fg/25" dir="rtl">{tier.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-fg mb-4">What You&apos;re Supporting</h2>
        <div className="space-y-3">
          {[
            "2,939 verified shelter locations across Israel",
            "Instant shelter finding for residents, tourists, and new immigrants",
            "Free access with no ads, no premium tiers, no paywalls",
            "Zero personal data collection — complete privacy",
            "Continuous data updates from municipal open data sources",
            "A life-saving tool available 24/7 during emergencies",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-live mt-0.5 flex-shrink-0" />
              <span className="text-sm text-fg/70">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-fg mb-3">Corporate Sponsorship</h2>
        <p className="text-sm text-fg/60 mb-4">
          If your organization would like to sponsor Get Shelter, we offer branded acknowledgment
          on the app and website. Contact us to discuss partnership opportunities.
        </p>
        <a href="mailto:donate@getshelter.app?subject=Corporate%20Sponsorship%20-%20Get%20Shelter" className="inline-flex items-center gap-2 text-sm text-brand-soft hover:text-brand-softer font-semibold">
          <Mail className="h-4 w-4" />
          donate@getshelter.app
        </a>
      </section>

      <section className="mb-4">
        <div className="bg-fg/4 border border-fg/8 rounded-xl p-5">
          <h3 className="text-sm font-bold text-fg mb-2">Transparency Promise</h3>
          <p className="text-xs text-fg/50 leading-relaxed">
            Get Shelter is a community project dedicated to public safety. We are committed to full
            transparency about how donations are used. We do not take salaries from donations — 100%
            goes toward infrastructure, data, and development costs. We aim to register as a
            recognized non-profit (amuta / עמותה) in Israel to provide tax-deductible receipts.
          </p>
        </div>
      </section>
    </main>
  )
}

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
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-black mb-2">Support Get Shelter</h1>
        <p className="text-lg text-white/60 max-w-lg mx-auto">
          Help us keep this life-saving service free and available for everyone in Israel.
        </p>
        <p className="text-lg text-white/50 mt-1" dir="rtl">עזרו לנו לשמור על השירות הזה בחינם ונגיש לכולם</p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Where Your Donation Goes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Server, title: "Hosting & Infrastructure", desc: "Servers that handle thousands of simultaneous requests during sirens", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/15" },
            { icon: Database, title: "Data Verification", desc: "On-the-ground verification of shelter locations, accessibility, and status", color: "text-green-400", bg: "bg-green-500/10 border-green-500/15" },
            { icon: Code2, title: "Development", desc: "New features like offline mode, push notifications, and real-time alerts", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/15" },
            { icon: Shield, title: "Data Expansion", desc: "Adding more shelter data from municipalities across Israel", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/15" },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl p-4 border ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-white/50 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="bg-gradient-to-b from-red-950/40 to-red-950/20 border border-red-500/20 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-black text-white mb-2">Make a Donation</h2>
          <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
            Every contribution, no matter the size, helps us maintain and improve the service.
            100% of donations go toward the project.
          </p>
          <div className="bg-white/5 rounded-xl p-5 max-w-sm mx-auto border border-white/10">
            <Mail className="h-6 w-6 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-white mb-1">Contact us to donate</p>
            <a
              href="mailto:donate@getshelter.app?subject=Get%20Shelter%20Donation"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors mt-2"
            >
              <Heart className="h-4 w-4" />
              donate@getshelter.app
            </a>
            <p className="text-xs text-white/30 mt-3">
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
              <div key={tier.amount} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <span className="text-lg font-black text-white">{tier.amount}</span>
                <p className="text-[10px] text-white/40 font-semibold">{tier.label}</p>
                <p className="text-[10px] text-white/25" dir="rtl">{tier.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">What You&apos;re Supporting</h2>
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
              <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-white/70">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">Corporate Sponsorship</h2>
        <p className="text-sm text-white/60 mb-4">
          If your organization would like to sponsor Get Shelter, we offer branded acknowledgment
          on the app and website. Contact us to discuss partnership opportunities.
        </p>
        <a href="mailto:donate@getshelter.app?subject=Corporate%20Sponsorship%20-%20Get%20Shelter" className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-semibold">
          <Mail className="h-4 w-4" />
          donate@getshelter.app
        </a>
      </section>

      <section className="mb-4">
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Transparency Promise</h3>
          <p className="text-xs text-white/50 leading-relaxed">
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

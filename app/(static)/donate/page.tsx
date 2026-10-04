import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Shield, Heart, Server, Database, Code2, CheckCircle2, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Donate - Support Get Shelter | Emergency Shelter Locator",
  description:
    "Support Get Shelter, the free emergency bomb shelter locator for Israel. Your donation helps keep the service running and save lives.",
  alternates: { canonical: "/donate" },
}

export default function DonatePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20 space-y-10">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mx-auto mb-5">
          <Heart className="h-6 w-6" />
        </div>
        <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg mb-3">Support Get Shelter</h1>
        <p className="text-body text-fg-muted max-w-lg mx-auto">
          Help us keep this life-saving service free and available for everyone in Israel.
        </p>
        <p className="text-body text-fg-muted mt-1" dir="rtl">עזרו לנו לשמור על השירות הזה בחינם ונגיש לכולם</p>
      </div>

      <section>
        <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">Where Your Donation Goes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Server, title: "Hosting & Infrastructure", desc: "Servers that handle thousands of simultaneous requests during sirens", color: "text-info" },
            { icon: Database, title: "Data Verification", desc: "On-the-ground verification of shelter locations, accessibility, and status", color: "text-live" },
            { icon: Code2, title: "Development", desc: "New features like offline mode, push notifications, and real-time alerts", color: "text-info" },
            { icon: Shield, title: "Data Expansion", desc: "Adding more shelter data from municipalities across Israel", color: "text-warn" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-surface-2 border border-line p-5">
              <item.icon className={`h-5 w-5 ${item.color} mb-3`} />
              <h3 className="text-body font-semibold text-fg">{item.title}</h3>
              <p className="text-label text-fg-muted mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-2xl bg-surface-2 border border-line p-6 sm:p-8 text-center">
          <h2 className="text-heading font-semibold text-fg tracking-tight mb-2">Make a Donation</h2>
          <p className="text-body text-fg-muted mb-6 max-w-md mx-auto">
            Every contribution, no matter the size, helps us maintain and improve the service.
            100% of donations go toward the project.
          </p>
          <div className="bg-fg/6 rounded-xl p-5 max-w-sm mx-auto border border-line">
            <Mail className="h-6 w-6 text-brand-bright mx-auto mb-3" />
            <p className="text-body font-semibold text-fg mb-3">Contact us to donate</p>
            <Button asChild variant="primary" size="lg">
              <a href="mailto:donate@getshelter.app?subject=Get%20Shelter%20Donation">
                <Heart className="h-4 w-4" />
                donate@getshelter.app
              </a>
            </Button>
            <p className="text-caption text-fg-subtle mt-3">
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
              <div key={tier.amount} className="bg-fg/6 border border-line rounded-xl px-4 py-3 text-center min-w-[88px]">
                <span className="text-title font-semibold text-fg">{tier.amount}</span>
                <p className="text-caption text-fg-muted font-medium">{tier.label}</p>
                <p className="text-caption text-fg-subtle" dir="rtl">{tier.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-heading font-semibold text-fg tracking-tight mb-4">What You&apos;re Supporting</h2>
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
              <span className="text-body text-fg-muted">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-heading font-semibold text-fg tracking-tight mb-3">Corporate Sponsorship</h2>
        <p className="text-body text-fg-muted leading-relaxed mb-4">
          If your organization would like to sponsor Get Shelter, we offer branded acknowledgment
          on the app and website. Contact us to discuss partnership opportunities.
        </p>
        <a href="mailto:donate@getshelter.app?subject=Corporate%20Sponsorship%20-%20Get%20Shelter" className="inline-flex items-center gap-2 text-body text-info hover:underline underline-offset-4 font-semibold">
          <Mail className="h-4 w-4" />
          donate@getshelter.app
        </a>
      </section>

      <section>
        <div className="rounded-2xl bg-surface-2 border border-line p-5">
          <h3 className="text-body font-semibold text-fg mb-2">Transparency Promise</h3>
          <p className="text-label text-fg-muted leading-relaxed">
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

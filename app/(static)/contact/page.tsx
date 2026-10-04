import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Shield, Mail, AlertTriangle, MessageSquare, Bug, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact - Get Shelter | Report Issues & Get Help",
  description:
    "Contact Get Shelter to report incorrect shelter data, get help, or provide feedback. Help us improve the emergency shelter locator for Israel.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mb-5">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg">Contact Us</h1>
        <p className="text-body text-fg-muted mt-3">Report data issues, give feedback, or get help</p>
      </div>

      <div className="rounded-2xl border border-brand/25 bg-brand/8 p-4 mb-10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-brand-bright mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-brand-soft text-body">In an emergency, do NOT contact us. Call emergency services:</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <a href="tel:100" className="text-label font-semibold text-info bg-info/10 px-3 py-1.5 rounded-lg">100 Police</a>
              <a href="tel:101" className="text-label font-semibold text-brand-soft bg-brand/15 px-3 py-1.5 rounded-lg">101 MDA</a>
              <a href="tel:102" className="text-label font-semibold text-warn bg-warn/10 px-3 py-1.5 rounded-lg">102 Fire</a>
              <a href="tel:104" className="text-label font-semibold text-live bg-live/10 px-3 py-1.5 rounded-lg">104 Home Front</a>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl bg-surface-2 border border-line p-5">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-5 w-5 text-brand-bright" />
            <h2 className="text-title font-semibold text-fg">General Contact</h2>
          </div>
          <p className="text-body text-fg-muted mb-4">For general inquiries, partnership requests, or media inquiries:</p>
          <Button asChild variant="primary" size="md">
            <a href="mailto:donate@getshelter.app">
              <Mail className="h-4 w-4" />
              donate@getshelter.app
            </a>
          </Button>
        </section>

        <section className="rounded-2xl bg-surface-2 border border-line p-5">
          <div className="flex items-center gap-3 mb-3">
            <Database className="h-5 w-5 text-warn" />
            <h2 className="text-title font-semibold text-fg">Report Incorrect Data</h2>
          </div>
          <p className="text-body text-fg-muted mb-3">
            Found a shelter that doesn&apos;t exist, is locked, or has wrong coordinates? Help us improve our data:
          </p>
          <ul className="text-body text-fg-muted space-y-2 mb-4">
            <li className="flex items-start gap-2"><span className="text-warn font-semibold mt-0.5">1.</span><span>What is the issue? (wrong location, shelter doesn&apos;t exist, locked, etc.)</span></li>
            <li className="flex items-start gap-2"><span className="text-warn font-semibold mt-0.5">2.</span><span>What is the shelter address or approximate location?</span></li>
            <li className="flex items-start gap-2"><span className="text-warn font-semibold mt-0.5">3.</span><span>Any photos or additional details?</span></li>
          </ul>
          <Button asChild variant="secondary" size="md">
            <a href="mailto:donate@getshelter.app?subject=Data%20Issue%20Report%20-%20Get%20Shelter&body=Issue%20type%3A%20%5Bwrong%20location%20%2F%20shelter%20doesn%27t%20exist%20%2F%20locked%20%2F%20other%5D%0A%0AShelter%20address%20or%20location%3A%20%0A%0ADetails%3A%20">
              <AlertTriangle className="h-4 w-4" />
              Report Data Issue
            </a>
          </Button>
        </section>

        <section className="rounded-2xl bg-surface-2 border border-line p-5">
          <div className="flex items-center gap-3 mb-3">
            <Bug className="h-5 w-5 text-info" />
            <h2 className="text-title font-semibold text-fg">Report a Bug</h2>
          </div>
          <p className="text-body text-fg-muted mb-4">Found a technical issue with the app? Let us know what happened and we&apos;ll fix it.</p>
          <Button asChild variant="secondary" size="md">
            <a href="mailto:donate@getshelter.app?subject=Bug%20Report%20-%20Get%20Shelter&body=What%20happened%3A%20%0A%0AWhat%20I%20expected%3A%20%0A%0ADevice%20%2F%20browser%3A%20%0A%0AScreenshot%20(if%20possible)%3A%20">
              <Bug className="h-4 w-4" />
              Report Bug
            </a>
          </Button>
        </section>

        <section className="rounded-2xl bg-surface-2 border border-line p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-5 w-5 text-live" />
            <h2 className="text-title font-semibold text-fg">Feedback & Suggestions</h2>
          </div>
          <p className="text-body text-fg-muted mb-4">Have ideas for improving Get Shelter? We&apos;d love to hear from you.</p>
          <Button asChild variant="secondary" size="md">
            <a href="mailto:donate@getshelter.app?subject=Feedback%20-%20Get%20Shelter">
              <MessageSquare className="h-4 w-4" />
              Send Feedback
            </a>
          </Button>
        </section>
      </div>
    </main>
  )
}

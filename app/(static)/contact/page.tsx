import type { Metadata } from "next"
import { Shield, Mail, AlertTriangle, MessageSquare, Bug, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact - Get Shelter | Report Issues & Get Help",
  description:
    "Contact Get Shelter to report incorrect shelter data, get help, or provide feedback. Help us improve the emergency shelter locator for Israel.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-fg" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Contact Us</h1>
          <p className="text-sm text-fg/40">Report data issues, give feedback, or get help</p>
        </div>
      </div>

      <div className="bg-brand-deep/50 border border-brand-bright/30 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-brand-soft mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-brand-softer text-sm">In an emergency, do NOT contact us. Call emergency services:</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <a href="tel:100" className="text-xs font-bold text-info-soft bg-info-strong/15 px-2 py-1 rounded">100 Police</a>
              <a href="tel:101" className="text-xs font-bold text-brand-softer bg-brand-bright/15 px-2 py-1 rounded">101 MDA</a>
              <a href="tel:102" className="text-xs font-bold text-orange-300 bg-orange-500/15 px-2 py-1 rounded">102 Fire</a>
              <a href="tel:104" className="text-xs font-bold text-green-300 bg-live-strong/15 px-2 py-1 rounded">104 Home Front</a>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-fg/4 border border-fg/8 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-5 w-5 text-brand-soft" />
            <h2 className="text-lg font-bold text-fg">General Contact</h2>
          </div>
          <p className="text-sm text-fg/60 mb-4">For general inquiries, partnership requests, or media inquiries:</p>
          <a href="mailto:donate@getshelter.app" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-strong text-fg font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Mail className="h-4 w-4" />
            donate@getshelter.app
          </a>
        </section>

        <section className="bg-fg/4 border border-fg/8 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="h-5 w-5 text-warn" />
            <h2 className="text-lg font-bold text-fg">Report Incorrect Data</h2>
          </div>
          <p className="text-sm text-fg/60 mb-3">
            Found a shelter that doesn&apos;t exist, is locked, or has wrong coordinates? Help us improve our data:
          </p>
          <ul className="text-sm text-fg/50 space-y-2 mb-4">
            <li className="flex items-start gap-2"><span className="text-warn mt-0.5">1.</span><span>What is the issue? (wrong location, shelter doesn&apos;t exist, locked, etc.)</span></li>
            <li className="flex items-start gap-2"><span className="text-warn mt-0.5">2.</span><span>What is the shelter address or approximate location?</span></li>
            <li className="flex items-start gap-2"><span className="text-warn mt-0.5">3.</span><span>Any photos or additional details?</span></li>
          </ul>
          <a href="mailto:donate@getshelter.app?subject=Data%20Issue%20Report%20-%20Get%20Shelter&body=Issue%20type%3A%20%5Bwrong%20location%20%2F%20shelter%20doesn%27t%20exist%20%2F%20locked%20%2F%20other%5D%0A%0AShelter%20address%20or%20location%3A%20%0A%0ADetails%3A%20" className="inline-flex items-center gap-2 bg-warn-strong hover:bg-warn-press text-fg font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <AlertTriangle className="h-4 w-4" />
            Report Data Issue
          </a>
        </section>

        <section className="bg-fg/4 border border-fg/8 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Bug className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold text-fg">Report a Bug</h2>
          </div>
          <p className="text-sm text-fg/60 mb-4">Found a technical issue with the app? Let us know what happened and we&apos;ll fix it.</p>
          <a href="mailto:donate@getshelter.app?subject=Bug%20Report%20-%20Get%20Shelter&body=What%20happened%3A%20%0A%0AWhat%20I%20expected%3A%20%0A%0ADevice%20%2F%20browser%3A%20%0A%0AScreenshot%20(if%20possible)%3A%20" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-fg font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Bug className="h-4 w-4" />
            Report Bug
          </a>
        </section>

        <section className="bg-fg/4 border border-fg/8 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-5 w-5 text-live" />
            <h2 className="text-lg font-bold text-fg">Feedback & Suggestions</h2>
          </div>
          <p className="text-sm text-fg/60 mb-4">Have ideas for improving Get Shelter? We&apos;d love to hear from you.</p>
          <a href="mailto:donate@getshelter.app?subject=Feedback%20-%20Get%20Shelter" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-fg font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <MessageSquare className="h-4 w-4" />
            Send Feedback
          </a>
        </section>
      </div>
    </main>
  )
}

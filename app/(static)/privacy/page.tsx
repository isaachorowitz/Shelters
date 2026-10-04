import type { Metadata } from "next"
import Link from "next/link"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - Get Shelter",
  description:
    "Privacy Policy for Get Shelter. We do not collect, store, or share your personal data. Your location stays on your device.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mb-5">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg">Privacy Policy</h1>
        <p className="text-body text-fg-muted mt-3">Last updated: February 2026</p>
      </div>

      <div className="rounded-2xl border border-live/25 bg-live/8 p-5 mb-10">
        <p className="text-live font-semibold text-body">
          TL;DR — We do not collect, store, or share any of your personal data. Your location never leaves your device.
        </p>
        <p className="text-live text-label mt-2" dir="rtl">
          בקיצור — אנחנו לא אוספים, שומרים או משתפים מידע אישי שלכם. המיקום שלכם נשאר במכשיר שלכם בלבד.
        </p>
      </div>

      <div className="space-y-10 text-body text-fg-muted leading-relaxed [&_section]:space-y-3 [&_strong]:text-fg [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">1. Overview</h2>
          <p>
            Get Shelter (&quot;we,&quot; &quot;our,&quot; or &quot;the Service&quot;) is a free emergency shelter locator for Israel.
            We are committed to protecting your privacy. This policy explains what data we access, how we use it, and what we do not do.
          </p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">2. Data We Access</h2>
          <h3 className="text-title font-semibold text-fg pt-2">2.1 Location Data</h3>
          <p>When you grant permission, the Service accesses your device&apos;s GPS location to find nearby shelters. This data is:</p>
          <ul>
            <li><strong>Processed entirely on your device</strong> and in your browser</li>
            <li><strong>Sent only to our API</strong> as latitude/longitude coordinates to calculate distances — this request is not logged or stored</li>
            <li><strong>Never stored</strong> on our servers, databases, or any persistent storage</li>
            <li><strong>Never shared</strong> with third parties for advertising, analytics, or any other purpose</li>
          </ul>
          <h3 className="text-title font-semibold text-fg pt-2">2.2 Address Searches</h3>
          <p>
            When you use the address search feature, your search query is sent to <strong>OpenStreetMap Nominatim</strong> to convert addresses into coordinates. This is subject to{" "}
            <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="text-info hover:underline underline-offset-4">
              OpenStreetMap Foundation&apos;s Privacy Policy
            </a>. We do not store or log your search queries.
          </p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">3. Data We Do NOT Collect</h2>
          <p>We do not collect, store, or process:</p>
          <ul>
            <li>Names, email addresses, or any personal identifiers</li>
            <li>Account credentials (there are no accounts)</li>
            <li>Device identifiers or fingerprints</li>
            <li>IP addresses (we do not log requests)</li>
            <li>Browsing history or usage patterns</li>
            <li>Location history or movement tracking</li>
            <li>Cookies or local storage for tracking purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">4. Cookies and Tracking</h2>
          <p>
            <strong>We do not use cookies.</strong> We do not use analytics trackers, advertising pixels, or any form of user tracking. There are no Google Analytics, Facebook Pixel, or similar services running on this application.
          </p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">5. Third-Party Services</h2>
          <p>The Service interacts with the following third-party services:</p>
          <div className="space-y-3 mt-3">
            <div className="rounded-2xl bg-surface-2 border border-line p-5">
              <p className="font-semibold text-fg text-body">OpenStreetMap Nominatim</p>
              <p className="text-label text-fg-muted mt-1">Address-to-coordinates geocoding. Your search text is sent to their API. They may log IP addresses per their privacy policy.</p>
            </div>
            <div className="rounded-2xl bg-surface-2 border border-line p-5">
              <p className="font-semibold text-fg text-body">CARTO Basemaps</p>
              <p className="text-label text-fg-muted mt-1">Map tiles are loaded from CARTO&apos;s CDN. Standard web requests (including IP address) are processed by their servers.</p>
            </div>
            <div className="rounded-2xl bg-surface-2 border border-line p-5">
              <p className="font-semibold text-fg text-body">Google Maps / Apple Maps / Waze</p>
              <p className="text-label text-fg-muted mt-1">When you tap &quot;Get Directions,&quot; you are redirected to the mapping app of your choice. Your interaction with those apps is governed by their respective privacy policies.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">6. Data Security</h2>
          <p>Since we do not collect or store personal data, there is no personal data at risk of breach. All communication uses HTTPS encryption. Shelter data served by our API is public, open-source information.</p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">7. Children&apos;s Privacy</h2>
          <p>The Service does not knowingly collect any personal information from anyone, including children under the age of 13. Since we collect no personal data, no special provisions are needed for minors.</p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">8. Your Rights</h2>
          <p>Under the Israeli Protection of Privacy Law (1981), you have the right to access, correct, or delete your personal data. Since we do not collect or store any personal data, there is no data to access, correct, or delete.</p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
        </section>

        <section>
          <h2 className="text-heading font-semibold text-fg tracking-tight">10. Contact</h2>
          <p>For questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:donate@getshelter.app" className="text-info hover:underline underline-offset-4">donate@getshelter.app</a>
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-label text-fg-subtle">
        <Link href="/terms" className="hover:text-fg-muted underline underline-offset-4">Terms of Service</Link>
        <Link href="/about" className="hover:text-fg-muted underline underline-offset-4">About</Link>
      </div>
    </main>
  )
}

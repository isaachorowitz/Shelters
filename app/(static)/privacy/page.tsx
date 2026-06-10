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
    <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Privacy Policy</h1>
          <p className="text-sm text-white/40">Last updated: February 2026</p>
        </div>
      </div>

      <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-4 mb-8">
        <p className="text-green-300 font-bold text-sm">
          TL;DR — We do not collect, store, or share any of your personal data. Your location never leaves your device.
        </p>
        <p className="text-green-300/70 text-sm mt-1" dir="rtl">
          בקיצור — אנחנו לא אוספים, שומרים או משתפים מידע אישי שלכם. המיקום שלכם נשאר במכשיר שלכם בלבד.
        </p>
      </div>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white">1. Overview</h2>
          <p>
            Get Shelter (&quot;we,&quot; &quot;our,&quot; or &quot;the Service&quot;) is a free emergency shelter locator for Israel.
            We are committed to protecting your privacy. This policy explains what data we access, how we use it, and what we do not do.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">2. Data We Access</h2>
          <h3 className="text-base font-semibold text-white/90">2.1 Location Data</h3>
          <p>When you grant permission, the Service accesses your device&apos;s GPS location to find nearby shelters. This data is:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Processed entirely on your device</strong> and in your browser</li>
            <li><strong>Sent only to our API</strong> as latitude/longitude coordinates to calculate distances — this request is not logged or stored</li>
            <li><strong>Never stored</strong> on our servers, databases, or any persistent storage</li>
            <li><strong>Never shared</strong> with third parties for advertising, analytics, or any other purpose</li>
          </ul>
          <h3 className="text-base font-semibold text-white/90">2.2 Address Searches</h3>
          <p>
            When you use the address search feature, your search query is sent to <strong>OpenStreetMap Nominatim</strong> to convert addresses into coordinates. This is subject to{" "}
            <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline">
              OpenStreetMap Foundation&apos;s Privacy Policy
            </a>. We do not store or log your search queries.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">3. Data We Do NOT Collect</h2>
          <p>We do not collect, store, or process:</p>
          <ul className="list-disc pl-5 space-y-1">
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
          <h2 className="text-lg font-bold text-white">4. Cookies and Tracking</h2>
          <p>
            <strong>We do not use cookies.</strong> We do not use analytics trackers, advertising pixels, or any form of user tracking. There are no Google Analytics, Facebook Pixel, or similar services running on this application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">5. Third-Party Services</h2>
          <p>The Service interacts with the following third-party services:</p>
          <div className="space-y-3 mt-2">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="font-semibold text-white text-sm">OpenStreetMap Nominatim</p>
              <p className="text-xs text-white/50">Address-to-coordinates geocoding. Your search text is sent to their API. They may log IP addresses per their privacy policy.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="font-semibold text-white text-sm">CARTO Basemaps</p>
              <p className="text-xs text-white/50">Map tiles are loaded from CARTO&apos;s CDN. Standard web requests (including IP address) are processed by their servers.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="font-semibold text-white text-sm">Google Maps / Apple Maps / Waze</p>
              <p className="text-xs text-white/50">When you tap &quot;Get Directions,&quot; you are redirected to the mapping app of your choice. Your interaction with those apps is governed by their respective privacy policies.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">6. Data Security</h2>
          <p>Since we do not collect or store personal data, there is no personal data at risk of breach. All communication uses HTTPS encryption. Shelter data served by our API is public, open-source information.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">7. Children&apos;s Privacy</h2>
          <p>The Service does not knowingly collect any personal information from anyone, including children under the age of 13. Since we collect no personal data, no special provisions are needed for minors.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">8. Your Rights</h2>
          <p>Under the Israeli Protection of Privacy Law (1981), you have the right to access, correct, or delete your personal data. Since we do not collect or store any personal data, there is no data to access, correct, or delete.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">10. Contact</h2>
          <p>For questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:donate@getshelter.app" className="text-red-400 hover:text-red-300 underline">donate@getshelter.app</a>
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-4 text-xs text-white/30">
        <Link href="/terms" className="hover:text-white/60 underline">Terms of Service</Link>
        <Link href="/about" className="hover:text-white/60 underline">About</Link>
      </div>
    </main>
  )
}

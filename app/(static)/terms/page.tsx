import type { Metadata } from "next"
import Link from "next/link"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service - Get Shelter",
  description:
    "Terms of Service for Get Shelter, the emergency bomb shelter locator for Israel. Read our terms, disclaimers, and usage conditions.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Terms of Service</h1>
          <p className="text-sm text-white/40">Last updated: February 2026</p>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white" id="acceptance">1. Acceptance of Terms / קבלת התנאים</h2>
          <p>By accessing or using Get Shelter (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          <p dir="rtl" className="text-white/60">בעצם השימוש באפליקציית Get Shelter, אתם מסכימים לתנאי שימוש אלה. אם אינכם מסכימים, אנא הימנעו משימוש בשירות.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="description">2. Description of Service</h2>
          <p>Get Shelter is a free, community-driven web application that helps users locate nearby bomb shelters and protected spaces in Israel. The Service provides shelter location data, estimated travel times, and navigation links to third-party mapping services.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="critical-disclaimer">3. CRITICAL DISCLAIMER — READ CAREFULLY</h2>
          <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4 space-y-3">
            <p className="font-bold text-red-300">THIS SERVICE DOES NOT REPLACE OFFICIAL HOME FRONT COMMAND (פיקוד העורף) INSTRUCTIONS.</p>
            <p><strong>Data accuracy:</strong> Shelter locations are sourced from publicly available open data portals, community mapping projects, and NGO datasets. This data may be outdated, incomplete, or inaccurate. Shelters may have been relocated, locked, demolished, or otherwise made inaccessible since the data was last updated.</p>
            <p><strong>No guarantee of availability:</strong> We make no guarantee that any shelter listed in the Service is currently open, accessible, structurally sound, or available for public use.</p>
            <p><strong>Not a substitute for official guidance:</strong> In an emergency, always follow the instructions of the Israel Defense Forces Home Front Command (פיקוד העורף), local authorities, and emergency services. Call 104 for Home Front Command emergency instructions.</p>
            <p><strong>User responsibility:</strong> You are solely responsible for your safety decisions. The decision to navigate to any shelter shown in this app is made at your own risk and discretion.</p>
            <p dir="rtl" className="text-red-300/80 font-semibold">שירות זה אינו מחליף את הנחיות פיקוד העורף. בשעת חירום, פעלו בהתאם להנחיות פיקוד העורף בלבד. חייגו 104 להנחיות חירום.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="data-sources">4. Data Sources and Accuracy</h2>
          <p>Shelter data is compiled from Israeli municipal open data portals, Israel&apos;s national open data portal (data.gov.il), non-governmental organizations, and community mapping projects. We make reasonable efforts to keep data current, but we do not independently verify each shelter location.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="as-is">5. Service Provided &quot;As Is&quot;</h2>
          <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="limitation">6. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GET SHELTER, ITS CREATORS, CONTRIBUTORS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Personal injury, bodily harm, or death</li>
            <li>Property damage</li>
            <li>Inability to access a shelter</li>
            <li>Inaccurate shelter locations or directions</li>
            <li>Service unavailability during an emergency</li>
            <li>Reliance on information provided by the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="indemnification">7. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Get Shelter, its creators, contributors, volunteers, and affiliates from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="location-data">8. Location Data</h2>
          <p>The Service uses your device&apos;s geolocation capabilities to determine your position and find nearby shelters. Location data is processed entirely on your device and is not stored, transmitted to our servers, or shared with third parties. See our{" "}
            <Link href="/privacy" className="text-red-400 hover:text-red-300 underline">Privacy Policy</Link>{" "}for more information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="third-party">9. Third-Party Services</h2>
          <p>The Service integrates with OpenStreetMap Nominatim (geocoding), CARTO (map tiles), and Google Maps / Apple Maps / Waze (navigation). Use of these services is subject to their respective terms and privacy policies.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="modifications">10. Modifications to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="governing-law">11. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to its conflict of law provisions.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white" id="contact">12. Contact</h2>
          <p>For questions about these Terms, contact us at{" "}
            <a href="mailto:donate@getshelter.app" className="text-red-400 hover:text-red-300 underline">donate@getshelter.app</a>
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-4 text-xs text-white/30">
        <Link href="/privacy" className="hover:text-white/60 underline">Privacy Policy</Link>
        <Link href="/about" className="hover:text-white/60 underline">About</Link>
      </div>
    </main>
  )
}

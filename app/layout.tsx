import { Geist, Heebo } from "next/font/google"
import "leaflet/dist/leaflet.css"
import "@/styles/tokens.css"
import "./globals.css"
import type { Metadata, Viewport } from "next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

// Hebrew glyphs. Geist covers Latin; the font stack falls back to Heebo per glyph.
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://getshelter.app"),
  title: {
    default: "GET SHELTER - Bomb Shelter Locator Israel | מקלט עכשיו",
    template: "%s | Get Shelter",
  },
  description:
    "Find the nearest bomb shelter in Israel in seconds. Free emergency shelter locator with GPS navigation to 7,500+ public shelters, reinforced rooms, and protected spaces. מקלט עכשיו - מצא את המקלט הקרוב אליך.",
  keywords: [
    "bomb shelter Israel",
    "מקלט",
    "מקלט ציבורי",
    "shelter locator",
    "מקלט עכשיו",
    "emergency shelter",
    "מקלטים",
    "bomb shelter map Israel",
    "find shelter near me",
    "מפת מקלטים",
    "Israel shelter finder",
    "reinforced room",
    "mamad",
    "ממ\"ד",
    "home front command",
    "פיקוד העורף",
  ],
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GET SHELTER",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "GET SHELTER - Find the Nearest Bomb Shelter in Israel",
    description:
      "Free emergency shelter locator. GPS navigation to 7,500+ shelters across Israel. מקלט עכשיו.",
    type: "website",
    siteName: "Get Shelter",
    locale: "en_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "GET SHELTER - Bomb Shelter Locator Israel",
    description:
      "Find the nearest bomb shelter in seconds. Free GPS shelter finder for Israel.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0A0A0B",
  viewportFit: "cover",
}

function JsonLd() {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Get Shelter",
    alternateName: "מקלט עכשיו",
    url: "https://getshelter.app",
    description:
      "Free emergency bomb shelter locator for Israel. Find the nearest shelter in seconds using GPS.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ILS",
    },
    author: {
      "@type": "Organization",
      name: "Get Shelter",
      url: "https://getshelter.app",
      email: "donate@getshelter.app",
    },
    inLanguage: ["en", "he"],
    countryOfOrigin: {
      "@type": "Country",
      name: "Israel",
    },
  }

  const emergencyService = {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    name: "Get Shelter - Bomb Shelter Locator",
    description:
      "Locates the nearest public bomb shelter in Israel during emergencies",
    url: "https://getshelter.app",
    areaServed: {
      "@type": "Country",
      name: "Israel",
    },
    serviceType: "Emergency Shelter Locator",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(emergencyService) }}
      />
    </>
  )
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${geistSans.variable} ${heebo.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <JsonLd />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

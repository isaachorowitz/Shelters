import { Geist } from "next/font/google"
import "./globals.css"
import { Metadata, Viewport } from 'next'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "SHELTER NOW - Bomb Shelter Locator",
  description: "Emergency bomb shelter locator for Israel - Find the nearest shelter in seconds",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SHELTER NOW",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "SHELTER NOW - Bomb Shelter Locator",
    description: "Emergency bomb shelter locator for Israel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHELTER NOW - Bomb Shelter Locator",
    description: "Emergency bomb shelter locator for Israel",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#DC2626',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

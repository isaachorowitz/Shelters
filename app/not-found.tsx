import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-brand-bright" />
      </div>
      <h1 className="text-4xl font-black mb-2">404</h1>
      <p className="text-lg text-fg/60 mb-1">Page not found</p>
      <p className="text-sm text-fg/40 mb-6 text-center max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist. Use the shelter finder to locate nearby shelters.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-brand hover:bg-brand-strong text-fg font-bold px-6 py-3 rounded-xl text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Find Nearest Shelter
      </Link>
      <div className="flex gap-4 mt-8 text-xs text-fg/25">
        <Link href="/about" className="hover:text-fg/50 underline">About</Link>
        <Link href="/safety-guide" className="hover:text-fg/50 underline">Safety Guide</Link>
        <Link href="/contact" className="hover:text-fg/50 underline">Contact</Link>
      </div>
    </div>
  )
}

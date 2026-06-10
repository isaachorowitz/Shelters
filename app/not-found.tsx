import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-4xl font-black mb-2">404</h1>
      <p className="text-lg text-white/60 mb-1">Page not found</p>
      <p className="text-sm text-white/40 mb-6 text-center max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist. Use the shelter finder to locate nearby shelters.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Find Nearest Shelter
      </Link>
      <div className="flex gap-4 mt-8 text-xs text-white/25">
        <Link href="/about" className="hover:text-white/50 underline">About</Link>
        <Link href="/safety-guide" className="hover:text-white/50 underline">Safety Guide</Link>
        <Link href="/contact" className="hover:text-white/50 underline">Contact</Link>
      </div>
    </div>
  )
}

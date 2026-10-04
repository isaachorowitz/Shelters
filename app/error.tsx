"use client"

import { Shield, RefreshCw, Phone } from "lucide-react"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-brand-bright" />
      </div>
      <h1 className="text-2xl font-black mb-2">Something Went Wrong</h1>
      <p className="text-sm text-fg/50 mb-6 text-center max-w-xs">
        The app encountered an error. Tap below to try again. In an emergency, call Home Front Command.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 bg-brand hover:bg-brand-strong text-fg font-bold px-6 py-3 rounded-xl text-sm transition-colors mb-4"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
      <div className="flex gap-3 mt-4">
        <a
          href="tel:104"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-green-300 bg-live-strong/15 border border-live-strong/20"
        >
          <Phone className="h-3 w-3" />
          104 Home Front
        </a>
        <a
          href="tel:100"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-info-soft bg-info-strong/15 border border-info-strong/20"
        >
          <Phone className="h-3 w-3" />
          100 Police
        </a>
      </div>
    </div>
  )
}

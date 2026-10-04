"use client"

import { Shield, RefreshCw, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mb-5">
        <Shield className="h-6 w-6" />
      </div>
      <h1 className="text-display font-bold tracking-tight text-fg mb-3">Something Went Wrong</h1>
      <p className="text-body text-fg-muted mb-8 text-center max-w-xs">
        The app encountered an error. Tap below to try again. In an emergency, call Home Front Command.
      </p>
      <Button variant="primary" size="lg" onClick={reset}>
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
      <div className="flex gap-3 mt-6">
        <Button asChild variant="secondary" size="md">
          <a href="tel:104">
            <Phone className="h-4 w-4" />
            104 Home Front
          </a>
        </Button>
        <Button asChild variant="secondary" size="md">
          <a href="tel:100">
            <Phone className="h-4 w-4" />
            100 Police
          </a>
        </Button>
      </div>
    </div>
  )
}

"use client"

import { Shield, List } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import DataSourcesDialog from "./data-sources-dialog"

interface HeaderProps {
  children?: ReactNode
  onOpenDirectory?: () => void
}

export default function Header({ children, onOpenDirectory }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-12 bg-black/95 backdrop-blur-xl border-b border-red-500/20"
      role="banner"
    >
      <div className="flex items-center h-full px-3 gap-2.5">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-xs font-black text-white tracking-wider leading-none">SHELTER NOW</h1>
            <p className="text-[8px] text-red-400/80 font-semibold tracking-widest uppercase leading-tight mt-0.5">
              Emergency Locator
            </p>
          </div>
        </div>

        {/* Search — fills the middle */}
        {children && <div className="flex-1 min-w-0">{children}</div>}

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onOpenDirectory && (
            <Button
              onClick={onOpenDirectory}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
              aria-label="Browse all shelters"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          )}
          <DataSourcesDialog />
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30"
            role="status"
            aria-label="System status: Active"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold text-green-400">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}

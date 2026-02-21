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
      className="fixed top-0 left-0 right-0 z-40 h-14 bg-black/95 backdrop-blur-xl border-b border-red-500/30"
      role="banner"
    >
      <div className="flex items-center h-full px-3 gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex-col hidden sm:flex">
            <h1 className="text-sm font-black text-white tracking-wider leading-none">
              SHELTER NOW
            </h1>
            <p className="text-[9px] text-red-400/90 font-semibold tracking-widest uppercase leading-tight mt-0.5">
              Emergency Locator / איתור מקלטים
            </p>
          </div>
        </div>

        {/* Search slot — fills the middle */}
        {children && <div className="flex-1 min-w-0">{children}</div>}

        <div className="flex items-center gap-1 flex-shrink-0">
          {onOpenDirectory && (
            <Button
              onClick={onOpenDirectory}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
              aria-label="Browse all shelters"
            >
              <List className="h-4 w-4" />
            </Button>
          )}
          <DataSourcesDialog />
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/15 border border-green-500/30"
            role="status"
            aria-label="System status: Active and ready"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-[11px] font-bold text-green-400">ACTIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}

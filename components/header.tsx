"use client"

import { Shield, List } from "lucide-react"
import type { ReactNode } from "react"
import DataSourcesDialog from "./data-sources-dialog"

interface HeaderProps {
  children?: ReactNode
  onOpenDirectory?: () => void
}

export default function Header({ children, onOpenDirectory }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-black/96 backdrop-blur-2xl border-b border-white/6"
      role="banner"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center h-14 px-4 gap-3">
        {/* Logo mark */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 flex-shrink-0"
            aria-hidden="true"
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <h1 className="text-[13px] font-black text-white tracking-wide">SHELTER NOW</h1>
            <p className="text-[9px] text-red-400/70 font-semibold tracking-widest uppercase mt-0.5">
              Emergency Locator
            </p>
          </div>
        </div>

        {/* Search bar — fills middle */}
        {children && <div className="flex-1 min-w-0">{children}</div>}

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onOpenDirectory && (
            <button
              onClick={onOpenDirectory}
              className="no-min-h w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white active:bg-white/10 transition-colors"
              aria-label="Browse all shelters"
            >
              <List className="h-[18px] w-[18px]" />
            </button>
          )}
          <DataSourcesDialog />
          <div
            className="no-min-h flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/12 border border-green-500/25"
            role="status"
            aria-label="System live"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold text-green-400 tracking-wide">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}

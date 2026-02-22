"use client"

import { Shield, Heart } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import DataSourcesDialog from "./data-sources-dialog"
import MobileMenu from "./mobile-menu"

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
      <div className="flex items-center h-14 px-3 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 flex-shrink-0"
            aria-hidden="true"
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[13px] font-black text-white tracking-wide">GET SHELTER</span>
            <span className="text-[9px] text-red-400/70 font-semibold tracking-widest uppercase mt-0.5">
              getshelter.app
            </span>
          </div>
        </div>

        {/* Search bar fills middle */}
        {children ? (
          <div className="flex-1 min-w-0">{children}</div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DataSourcesDialog />

          <div
            className="no-min-h flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/12 border border-green-500/25"
            role="status"
            aria-label="System live"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold text-green-400 tracking-wide">LIVE</span>
          </div>

          {/* Donate — always visible */}
          <Link
            href="/donate"
            className="no-min-h flex items-center gap-1.5 px-3 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[12px] font-bold transition-colors flex-shrink-0"
            aria-label="Donate"
          >
            <Heart className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Donate</span>
          </Link>

          {/* Sandwich menu */}
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

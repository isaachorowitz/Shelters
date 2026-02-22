"use client"

import Link from "next/link"
import { Shield, Heart } from "lucide-react"
import MobileMenu from "./mobile-menu"

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 bg-black/97 backdrop-blur-2xl border-b border-white/6">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label="Get Shelter — Go to shelter finder"
        >
          <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:bg-red-500 transition-colors flex-shrink-0">
            <Shield className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-black text-white tracking-wide">GET SHELTER</span>
            <span className="text-[9px] text-red-400/70 font-semibold tracking-widest uppercase">getshelter.app</span>
          </div>
        </Link>

        {/* Right: Donate + menu */}
        <div className="flex items-center gap-2">
          <Link
            href="/donate"
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[12px] font-bold transition-colors"
            aria-label="Donate"
          >
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Donate</span>
          </Link>

          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

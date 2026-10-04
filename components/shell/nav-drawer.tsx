"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Shield, ChevronRight, ArrowLeft } from "lucide-react"
import { NAV_SECTIONS, isActivePath, type NavLink } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/icon-button"
import { Brand } from "./brand"

/* ─────────────────────────────────────────────────────────────
   NAV ITEM
───────────────────────────────────────────────────────────── */

export function NavItem({ item, active }: { item: NavLink; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-colors",
        active ? "bg-fg/10 text-fg" : "text-fg/60"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-brand-soft" : "text-fg/30")} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="text-body font-semibold block">{item.label}</span>
        {item.desc && <span className="text-caption text-fg/30 leading-[1.2]">{item.desc}</span>}
      </div>
      {active && <ChevronRight className="h-3.5 w-3.5 text-fg/30 flex-shrink-0" aria-hidden="true" />}
    </Link>
  )
}

/** "Open Shelter Finder" card shown at the top of the menu on every page except the finder. */
export function BackToFinderLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 px-3.5 py-3 rounded-[14px] bg-brand/15 border border-brand/25 text-fg mb-4"
    >
      <div className="w-8 h-8 bg-brand rounded-sm flex items-center justify-center flex-shrink-0">
        <Shield className="h-4 w-4 text-fg" />
      </div>
      <div className="flex-1">
        <span className="text-ui font-bold block">Open Shelter Finder</span>
        <span className="text-caption text-fg/40">Find the nearest shelter now</span>
      </div>
      <ArrowLeft className="h-3.5 w-3.5 text-brand/70 rotate-180 flex-shrink-0" aria-hidden="true" />
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────
   PANEL — static drawer contents (renders from props alone)
───────────────────────────────────────────────────────────── */

interface NavDrawerPanelProps {
  pathname: string
  onClose?: () => void
  className?: string
}

export function NavDrawerPanel({ pathname, onClose, className }: NavDrawerPanelProps) {
  return (
    <div className={cn("w-drawer max-w-[85vw] bg-surface-2 border-l border-fg/8 flex flex-col shadow-drawer", className)}>
      <div className="flex items-center justify-between px-4 h-14 pt-safe border-b border-fg/6 flex-shrink-0">
        <Link href="/" className="flex items-center" aria-label="Go to shelter finder">
          <Brand wordmark="inline" />
        </Link>
        <IconButton label="Close menu" onClick={onClose}>
          <X />
        </IconButton>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navigation menu">
        {pathname !== "/" && <BackToFinderLink />}

        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="text-tiny font-bold text-fg/25 uppercase tracking-[0.12em] px-2 mb-1">{section.label}</p>
            {section.items.map((item) => (
              <NavItem key={item.href} item={item} active={isActivePath(pathname, item.href)} />
            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-fg/6 flex-shrink-0">
        <p className="text-tiny text-fg/20 text-center">getshelter.app · Free · No ads · No tracking</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DRAWER — portal, backdrop, slide-in, dismissal
───────────────────────────────────────────────────────────── */

export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Close on route change
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open, onClose])

  // Escape key
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <div className={cn("fixed inset-0 z-drawer", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-scrim/65 backdrop-blur-sm transition-opacity duration-200 ease-[ease]",
          open ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          "absolute inset-y-0 right-0 flex transition-transform duration-drawer ease-spring",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <NavDrawerPanel pathname={pathname} onClose={onClose} className="h-full" />
      </div>
    </div>,
    document.body
  )
}

/* ─────────────────────────────────────────────────────────────
   MENU BUTTON — hamburger that owns the drawer's open state
───────────────────────────────────────────────────────────── */

export function MenuButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton label="Open menu" size="md" className="text-fg/50" onClick={() => setOpen(true)} aria-expanded={open}>
        <Menu />
      </IconButton>
      <NavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Navigation } from "lucide-react"
import { NAV_SECTIONS, isActivePath, type NavLink } from "@/lib/nav"
import { EMERGENCY_NUMBERS } from "@/lib/emergency"
import { cn } from "@/lib/utils"
import { Bi } from "@/components/ui/bi"
import { Button } from "@/components/ui/button"
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
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
        active ? "bg-fg/8 text-fg" : "text-fg-muted hover:text-fg hover:bg-fg/6"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", active ? "text-brand-bright" : "text-fg-subtle")} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="text-body font-medium block">{item.label}</span>
        {item.desc && <span className="text-caption text-fg-subtle block">{item.desc}</span>}
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────
   EMERGENCY NUMBERS — tap to call
───────────────────────────────────────────────────────────── */

export function EmergencyNumbers({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="px-1 mb-2 text-eyebrow font-semibold uppercase tracking-wider text-fg-subtle">
        <Bi he="מספרי חירום" en="Emergency" />
      </p>
      <div className="grid grid-cols-2 gap-2">
        {EMERGENCY_NUMBERS.map((n) => (
          <a
            key={n.number}
            href={`tel:${n.number}`}
            className="card-press flex items-center gap-2.5 h-14 px-3 rounded-xl bg-surface-2 border border-line hover:border-line-strong min-w-0"
            aria-label={`Call ${n.number}, ${n.full} (${n.he})`}
          >
            <span className="text-title font-semibold tabular-nums text-fg">{n.number}</span>
            <span className="flex flex-col min-w-0 leading-tight">
              <span lang="he" dir="rtl" className="text-caption text-fg-muted truncate self-start">{n.he}</span>
              <span lang="en" className="text-caption text-fg-subtle truncate">{n.en}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PANEL — static drawer contents (renders from props alone)
───────────────────────────────────────────────────────────── */

const MAIN_SECTIONS = NAV_SECTIONS.filter((s) => s.label !== "Legal")
const LEGAL = NAV_SECTIONS.find((s) => s.label === "Legal")?.items ?? []

interface NavDrawerPanelProps {
  pathname: string
  onClose?: () => void
  className?: string
}

export function NavDrawerPanel({ pathname, onClose, className }: NavDrawerPanelProps) {
  return (
    <div className={cn("w-drawer max-w-[88vw] bg-surface-1 border-l border-line flex flex-col shadow-drawer", className)}>
      <div className="flex items-center justify-between pl-4 pr-2 h-14 box-content pt-safe flex-shrink-0">
        <Link href="/" className="flex items-center" aria-label="Go to shelter finder">
          <Brand />
        </Link>
        <IconButton label="Close menu" onClick={onClose}>
          <X />
        </IconButton>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4" aria-label="Navigation menu">
        {pathname !== "/" && (
          <Button asChild variant="primary" size="xl" className="w-full mb-5 mt-1">
            <Link href="/">
              <Navigation aria-hidden="true" />
              <Bi he="מצא מקלט" en="Find shelter" />
            </Link>
          </Button>
        )}

        <EmergencyNumbers className="mb-6" />

        {MAIN_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-3 mb-1 text-eyebrow font-semibold uppercase tracking-wider text-fg-subtle">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} active={isActivePath(pathname, item.href)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-line flex-shrink-0">
        <div className="flex items-center gap-4 text-caption">
          {LEGAL.map((item) => (
            <Link key={item.href} href={item.href} className="text-fg-subtle hover:text-fg">
              {item.label}
            </Link>
          ))}
        </div>
        <p className="mt-1.5 text-caption text-fg-subtle">Free · No ads · No tracking</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DRAWER — portal, backdrop, slide-in, dismissal
───────────────────────────────────────────────────────────── */

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
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

  // Move focus into the drawer on open; give it back to the trigger on close
  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => {
      drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    })
    return () => {
      cancelAnimationFrame(frame)
      returnFocusRef.current?.focus?.()
    }
  }, [open])

  // Escape closes; Tab stays inside the drawer
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab" || !drawerRef.current) return
      const items = [...drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!drawerRef.current.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <div className={cn("fixed inset-0 z-drawer", open ? "pointer-events-auto" : "pointer-events-none")} inert={!open}>
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-scrim/60 backdrop-blur-sm transition-opacity duration-200",
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
      <IconButton label="Open menu" onClick={() => setOpen(true)} aria-expanded={open}>
        <Menu />
      </IconButton>
      <NavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}

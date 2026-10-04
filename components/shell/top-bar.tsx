"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Navigation } from "lucide-react"
import { isActivePath } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { Bi } from "@/components/ui/bi"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import DataSourcesDialog from "@/components/data-sources-dialog"
import { Brand } from "./brand"
import { DonateButton } from "./donate-button"
import { MenuButton } from "./nav-drawer"

/** Links shown inline in the content-page bar on desktop. */
const SITE_LINKS = [
  { href: "/shelters", label: "Directory" },
  { href: "/safety-guide", label: "Safety guide" },
  { href: "/about", label: "About" },
]

interface TopBarProps {
  /**
   * app:  the shelter finder. Fixed, full width, address search.
   * site: content pages. Sticky, centered column, inline links on desktop.
   */
  variant?: "app" | "site"
  /**
   * App variant: renders the address search. Receives a `done` callback the
   * search calls after a pick (closes the phone overlay) and whether it is
   * rendering inside that overlay (so it can take focus).
   */
  search?: (done: () => void, overlay: boolean) => ReactNode
  /** Forces the phone search overlay open (catalog previews). */
  defaultSearchOpen?: boolean
}

/** The one top navigation bar used on every page. */
export function TopBar({ variant = "app", search, defaultSearchOpen = false }: TopBarProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(defaultSearchOpen)
  const close = () => setSearchOpen(false)

  if (variant === "site") {
    return (
      <header className="sticky top-0 z-header bg-bg/80 backdrop-blur-xl border-b border-line">
        <div className="max-w-content mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center" aria-label="Get Shelter, go to the shelter finder">
            <Brand />
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {SITE_LINKS.map((l) => {
              const active = isActivePath(pathname ?? "", l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "h-9 px-3 inline-flex items-center rounded-lg text-label font-medium transition-colors",
                    active ? "bg-fg/8 text-fg" : "text-fg-muted hover:text-fg"
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden sm:block">
              <DonateButton />
            </div>
            <Button asChild variant="primary" size="sm" className="shadow-none">
              <Link href="/">
                <Navigation aria-hidden="true" />
                <Bi he="מצא מקלט" en="Find shelter" enClassName="hidden sm:inline-flex" />
              </Link>
            </Button>
            <MenuButton />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 inset-x-0 z-header pt-safe bg-bg/80 backdrop-blur-xl border-b border-line" role="banner">
      <div className="relative h-14 px-3 md:px-4 flex items-center gap-3">
        <Brand />

        {/* Desktop: search always visible */}
        <div className="hidden md:block flex-1 max-w-md ml-4">{search?.(() => {}, false)}</div>

        <div className="ml-auto flex items-center gap-1">
          {search && (
            <IconButton label="Search an address" className="md:hidden" onClick={() => setSearchOpen(true)}>
              <Search />
            </IconButton>
          )}
          <div className="hidden md:flex items-center gap-1">
            <DataSourcesDialog />
            <DonateButton />
          </div>
          <MenuButton />
        </div>

        {/* Phone: search expands over the bar */}
        {search && searchOpen && (
          <div className="md:hidden absolute inset-0 px-3 flex items-center gap-2 bg-bg animate-in fade-in-0 duration-150">
            <div className="flex-1 min-w-0">{search(close, true)}</div>
            <Button variant="ghost" size="sm" onClick={close}>
              <Bi he="ביטול" en="Cancel" enClassName="hidden min-[400px]:inline-flex" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

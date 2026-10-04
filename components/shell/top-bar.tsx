import Link from "next/link"
import type { ReactNode } from "react"
import { StatusPill } from "@/components/ui/status-pill"
import DataSourcesDialog from "@/components/data-sources-dialog"
import { Brand } from "./brand"
import { DonateButton } from "./donate-button"
import { MenuButton } from "./nav-drawer"

interface TopBarProps {
  /**
   * app:  fixed, full width, search in the middle (the shelter finder).
   * site: sticky, centered column, logo links home (content pages).
   */
  variant?: "app" | "site"
  /** Middle slot, usually the address search. App variant only. */
  children?: ReactNode
}

/** The one top navigation bar used on every page. */
export function TopBar({ variant = "app", children }: TopBarProps) {
  if (variant === "site") {
    return (
      <header className="sticky top-0 z-header bg-bg/97 backdrop-blur-2xl border-b border-fg/6">
        <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center flex-shrink-0 group" aria-label="Get Shelter — Go to shelter finder">
            <Brand interactive />
          </Link>
          <div className="flex items-center gap-2">
            <DonateButton />
            <MenuButton />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className="fixed top-0 inset-x-0 z-header bg-bg/96 backdrop-blur-2xl border-b border-fg/6 pt-safe"
      role="banner"
    >
      <div className="flex items-center h-14 px-3 gap-2">
        <Brand collapseOnMobile />
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DataSourcesDialog />
          <StatusPill />
          <DonateButton />
          <MenuButton />
        </div>
      </div>
    </header>
  )
}

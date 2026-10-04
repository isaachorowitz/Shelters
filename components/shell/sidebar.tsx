import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  /** Accessible name for the landmark. */
  label: string
  /** Fixed row at the top. */
  header?: ReactNode
  /** Fixed row at the bottom. */
  footer?: ReactNode
  /** id on the content column, used as the skip-link target. */
  contentId?: string
  children: ReactNode
  /** Defaults to hidden below `md`; pass "flex" to force it visible. */
  className?: string
}

/** Desktop column next to the map. Hidden on phones, where the bottom sheet takes over. */
export function Sidebar({ label, header, footer, contentId, children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex w-sidebar shrink-0 flex-col bg-surface-1 border-r border-line overflow-hidden z-sidebar",
        className
      )}
      aria-label={label}
    >
      <div className="flex flex-col h-full" id={contentId}>
        {header && <div className="shrink-0 px-4 pt-4 pb-3">{header}</div>}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3">{children}</div>
        {footer && <div className="shrink-0 border-t border-line p-3">{footer}</div>}
      </div>
    </aside>
  )
}

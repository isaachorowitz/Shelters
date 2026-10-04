import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  size?: "sm" | "md"
  /** Brightens on hover of an ancestor with the `group` class. */
  interactive?: boolean
  className?: string
}

/** Red rounded square with the shield icon. */
export function BrandMark({ size = "md", interactive, className }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "bg-brand flex items-center justify-center flex-shrink-0",
        size === "md" ? "w-8 h-8 rounded-xl shadow-lg shadow-brand/30" : "w-7 h-7 rounded-sm",
        interactive && "group-hover:bg-brand-bright transition-colors",
        className
      )}
      aria-hidden="true"
    >
      <Shield className={cn("text-fg", size === "md" ? "h-4 w-4" : "h-3.5 w-3.5")} />
    </div>
  )
}

interface BrandProps {
  /**
   * stacked: name over domain (top bars).
   * inline:  name only (menu drawer).
   */
  wordmark?: "stacked" | "inline"
  /** Hide the wordmark below the `sm` breakpoint (app top bar on phones). */
  collapseOnMobile?: boolean
  interactive?: boolean
  className?: string
}

/** Logo lockup: mark plus "GET SHELTER" wordmark. */
export function Brand({ wordmark = "stacked", collapseOnMobile, interactive, className }: BrandProps) {
  if (wordmark === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <BrandMark size="sm" interactive={interactive} />
        <span className="text-ui font-black text-fg tracking-wider">GET SHELTER</span>
      </div>
    )
  }
  return (
    <div className={cn("flex items-center flex-shrink-0", collapseOnMobile ? "gap-2" : "gap-2.5", className)}>
      <BrandMark interactive={interactive} />
      <div className={cn("flex-col leading-none", collapseOnMobile ? "hidden sm:flex" : "flex")}>
        <span className="text-ui font-black text-fg tracking-wide">GET SHELTER</span>
        <span
          className={cn(
            "text-micro text-brand-soft/70 font-semibold tracking-widest uppercase",
            collapseOnMobile && "mt-0.5"
          )}
        >
          getshelter.app
        </span>
      </div>
    </div>
  )
}

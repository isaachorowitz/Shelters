import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const MARK_SIZE = {
  sm: "w-7 h-7 rounded-lg [&_svg]:size-3.5",
  md: "w-8 h-8 rounded-[10px] [&_svg]:size-4",
  lg: "w-12 h-12 rounded-2xl [&_svg]:size-6",
}

/** Red rounded square with the shield. */
export function BrandMark({ size = "md", className }: BrandMarkProps) {
  return (
    <div
      className={cn("bg-brand text-white flex items-center justify-center flex-shrink-0", MARK_SIZE[size], className)}
      aria-hidden="true"
    >
      <Shield strokeWidth={2.4} />
    </div>
  )
}

interface BrandProps {
  /** Hide the wordmark below the `sm` breakpoint. */
  collapseOnMobile?: boolean
  className?: string
}

/** Logo lockup: mark plus "Get Shelter". */
export function Brand({ collapseOnMobile, className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-2.5 flex-shrink-0", className)}>
      <BrandMark />
      <span
        className={cn(
          "text-title font-semibold tracking-tight text-fg",
          collapseOnMobile && "hidden sm:inline"
        )}
      >
        Get Shelter
      </span>
    </div>
  )
}

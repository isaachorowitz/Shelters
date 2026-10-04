import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva("inline-flex items-center gap-1 rounded-full whitespace-nowrap", {
  variants: {
    tone: {
      brand: "bg-brand/15 text-brand-soft",
      neutral: "bg-fg/8 text-fg-muted",
      outline: "border border-line-strong text-fg-muted",
      live: "bg-live/12 text-live",
      warn: "bg-warn/12 text-warn",
    },
    size: {
      /** Uppercase flag ("Nearest"). */
      xs: "h-5 px-2 text-eyebrow font-semibold uppercase tracking-wider",
      sm: "h-6 px-2.5 text-caption font-medium",
      md: "h-8 px-3 text-label font-semibold",
    },
  },
  defaultVariants: { tone: "neutral", size: "sm" },
})

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

/** Small rounded label: flags, shelter type, counts. */
export function Chip({ className, tone, size, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ tone, size }), className)} {...props} />
}

export { chipVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva("inline-flex items-center rounded-full", {
  variants: {
    tone: {
      /** Shelter type on a card. */
      brand: "font-semibold bg-brand/12 text-brand-softer/85",
      /** "Closest shelter" flag. */
      highlight: "font-black uppercase tracking-widest bg-brand/25 text-brand-softer",
      /** Counts and neutral metadata. */
      neutral: "font-semibold bg-fg/5 text-fg/30",
    },
    size: {
      sm: "text-caption px-2 py-0.5",
      xs: "text-tiny px-2 py-0.5",
    },
  },
  defaultVariants: { tone: "neutral", size: "sm" },
})

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

/** Small rounded label: shelter type, "closest" flag, counts. */
export function Chip({ className, tone, size, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ tone, size }), className)} {...props} />
}

export { chipVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full flex-shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      size: {
        sm: "w-10 h-10 [&_svg]:size-[18px]",
        md: "w-11 h-11 [&_svg]:size-5",
        lg: "w-12 h-12 [&_svg]:size-5",
      },
      tone: {
        /** Bare icon on the chrome (menu, close, search). */
        ghost: "text-fg-muted hover:text-fg hover:bg-fg/8",
        /** Filled neutral circle. */
        surface: "bg-surface-3 text-fg border border-line hover:bg-fg/12",
        /** Frosted control floating over the map. */
        glass: "card-press bg-surface-2/85 text-fg border border-line-strong backdrop-blur-md shadow-popover hover:bg-surface-3",
      },
    },
    defaultVariants: { size: "md", tone: "ghost" },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Accessible name. Icon-only buttons must have one. */
  label: string
}

/** Round icon-only button: menu, close, search, and map controls. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, tone, label, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ size, tone }), className)}
      {...props}
    />
  )
)
IconButton.displayName = "IconButton"

export { iconButtonVariants }

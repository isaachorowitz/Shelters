import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "no-min-h inline-flex items-center justify-center rounded-full flex-shrink-0 transition-colors disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      size: {
        xs: "w-7 h-7 [&_svg]:size-3.5",
        sm: "w-8 h-8 [&_svg]:size-4",
        md: "w-9 h-9 [&_svg]:size-[18px]",
        lg: "w-11 h-11 [&_svg]:size-5",
      },
      tone: {
        /** Bare icon on the dark chrome (menu, close, info). */
        ghost: "text-fg/40 hover:text-fg",
        /** Frosted round button floating over the map. */
        glass: "card-press bg-scrim/88 border border-fg/18 backdrop-blur-md shadow-lg",
      },
    },
    defaultVariants: { size: "sm", tone: "ghost" },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Accessible name. Icon-only buttons must have one. */
  label: string
}

/** Round icon-only button. Used for menu, close, info, and map controls. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, tone, label, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(iconButtonVariants({ size, tone }), className)}
      {...props}
    />
  )
)
IconButton.displayName = "IconButton"

export { iconButtonVariants }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** The one main action on a surface (Navigate, Allow location). */
        primary: "bg-brand text-white hover:bg-brand-bright active:bg-brand-strong shadow-glow-brand",
        /** Everything else that is still a button. */
        secondary: "bg-surface-3 text-fg border border-line hover:bg-fg/12",
        /** Low-emphasis actions on a surface. */
        ghost: "text-fg-muted hover:text-fg hover:bg-fg/8",
        outline: "border border-line-strong text-fg hover:bg-fg/6",
        link: "text-info underline-offset-4 hover:underline",
        // shadcn names kept for compatibility
        default: "bg-brand text-white hover:bg-brand-bright active:bg-brand-strong",
        destructive: "bg-brand text-white hover:bg-brand-bright active:bg-brand-strong",
      },
      size: {
        sm: "h-9 px-3 text-label rounded-lg",
        md: "h-11 px-4 text-body rounded-xl",
        lg: "h-12 px-5 text-body rounded-xl [&_svg]:size-[18px]",
        xl: "h-[52px] px-6 text-title rounded-2xl [&_svg]:size-5",
        icon: "h-11 w-11 rounded-xl [&_svg]:size-5",
        default: "h-11 px-4 text-body rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

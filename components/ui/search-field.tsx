import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Swaps the search icon for a spinner. */
  loading?: boolean
  /** Shows a clear button when set and the field has a value. */
  onClear?: () => void
}

/** Pill-shaped search input used in the top bar and the location prompt. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ loading, onClear, value, className, ...props }, ref) => (
    <div
      className={cn(
        "flex items-center h-9 rounded-full overflow-hidden transition-all bg-fg/8 border border-fg/10",
        className
      )}
    >
      <div className="flex items-center justify-center w-9 h-9 flex-shrink-0">
        {loading ? (
          <Spinner className="h-3.5 w-3.5 text-brand-soft" />
        ) : (
          <Search className="h-3.5 w-3.5 text-fg/40" aria-hidden="true" />
        )}
      </div>
      <input
        ref={ref}
        type="text"
        inputMode="search"
        value={value}
        // 16px stops iOS Safari from zooming in on focus.
        className="flex-1 bg-transparent text-fg text-heading py-1.5 pr-1 outline-none placeholder:text-fg/30 min-w-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        dir="auto"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="no-min-h flex items-center justify-center w-8 h-8 mr-0.5 rounded-full text-fg/40 hover:text-fg flex-shrink-0 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
)
SearchField.displayName = "SearchField"

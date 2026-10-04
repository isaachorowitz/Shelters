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

/** Rounded search input used in the top bar and the location prompt. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ loading, onClear, value, className, ...props }, ref) => (
    <div
      className={cn(
        "flex items-center h-10 rounded-xl overflow-hidden transition-colors bg-fg/6 border border-line hover:border-line-strong focus-within:border-fg/30 focus-within:bg-fg/8",
        className
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 flex-shrink-0 text-fg-subtle">
        {loading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" aria-hidden="true" />}
      </div>
      <input
        ref={ref}
        type="text"
        inputMode="search"
        value={value}
        // 16px stops iOS Safari from zooming in on focus.
        className="flex-1 bg-transparent text-fg text-base py-2 pr-1 outline-none placeholder:text-fg-subtle min-w-0"
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
          className="flex items-center justify-center w-10 h-10 -mr-0.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-fg/8 flex-shrink-0 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
)
SearchField.displayName = "SearchField"

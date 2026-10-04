"use client"

import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { ExternalLink, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────────
   OPTION — one tappable row in an action sheet
───────────────────────────────────────────────────────────── */

type OptionTone = "waze" | "google" | "neutral"

const OPTION_TONE: Record<OptionTone, { row: string; tile: string }> = {
  waze: { row: "bg-waze/10 border-waze/15 text-waze", tile: "bg-waze/15" },
  google: { row: "bg-google/12 border-google/15 text-google", tile: "bg-google/15" },
  neutral: { row: "bg-fg/8 border-fg/12 text-fg", tile: "bg-fg/9" },
}

interface ActionSheetOptionProps {
  label: string
  icon: LucideIcon
  tone?: OptionTone
  /** Shows the "opens another app" arrow. */
  external?: boolean
  onClick?: () => void
}

export function ActionSheetOption({ label, icon: Icon, tone = "neutral", external = true, onClick }: ActionSheetOptionProps) {
  const t = OPTION_TONE[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("card-press w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left border", t.row)}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", t.tile)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <span className="text-heading font-bold">{label}</span>
      {external && <ExternalLink className="h-4 w-4 ml-auto opacity-30" aria-hidden="true" />}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   PANEL — the sheet itself, positioned by its parent
───────────────────────────────────────────────────────────── */

interface ActionSheetPanelProps {
  eyebrow: string
  title: string
  children: ReactNode
  cancelLabel?: string
  onCancel?: () => void
  className?: string
}

export function ActionSheetPanel({ eyebrow, title, children, cancelLabel = "ביטול / Cancel", onCancel, className }: ActionSheetPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-t-3xl overflow-hidden bg-surface-3/99 border border-b-0 border-fg/10 shadow-action-sheet pb-safe",
        className
      )}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-fg/20" />
      </div>

      <div className="px-5 pt-2 pb-4 border-b border-fg/6">
        <p className="text-caption font-semibold text-fg/35 uppercase tracking-widest text-center">{eyebrow}</p>
        <p className="text-title font-bold text-fg text-center mt-1 truncate px-4" dir="auto">{title}</p>
      </div>

      <div className="p-4 space-y-2.5">{children}</div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="card-press w-full py-4 rounded-2xl text-heading font-bold text-fg/60 bg-fg/6"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTION SHEET — modal bottom sheet with backdrop
───────────────────────────────────────────────────────────── */

interface ActionSheetProps extends Omit<ActionSheetPanelProps, "onCancel" | "className"> {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Accessible name for the dialog. */
  label: string
}

export function ActionSheet({ open, onOpenChange, label, ...panel }: ActionSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  if (!open) return null

  // Portaled to <body> so a blurred ancestor (the mobile bottom sheet) cannot
  // become its containing block and clip the backdrop.
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-modal bg-scrim/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 inset-x-0 z-modal" role="dialog" aria-modal="true" aria-label={label}>
        <ActionSheetPanel {...panel} onCancel={() => onOpenChange(false)} />
      </div>
    </>,
    document.body
  )
}

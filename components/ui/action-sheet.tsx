"use client"

import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

/* ─────────────────────────────────────────────────────────────
   OPTION — one tappable row in an action sheet
───────────────────────────────────────────────────────────── */

type OptionTone = "waze" | "google" | "neutral"

const TILE: Record<OptionTone, string> = {
  waze: "bg-waze/15 text-waze",
  google: "bg-google/15 text-google",
  neutral: "bg-fg/10 text-fg",
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-press w-full flex items-center gap-3 h-14 px-3 rounded-xl text-left bg-surface-3 hover:bg-fg/12"
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", TILE[tone])}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </div>
      <span className="text-body font-semibold text-fg">{label}</span>
      {external && <ArrowUpRight className="h-4 w-4 ml-auto text-fg-subtle" aria-hidden="true" />}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   PANEL — the sheet itself, positioned by its parent
───────────────────────────────────────────────────────────── */

interface ActionSheetPanelProps {
  eyebrow: ReactNode
  title: string
  children: ReactNode
  cancelLabel?: ReactNode
  onCancel?: () => void
  className?: string
}

export function ActionSheetPanel({ eyebrow, title, children, cancelLabel = "ביטול · Cancel", onCancel, className }: ActionSheetPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-t-sheet md:rounded-sheet overflow-hidden bg-surface-2 border border-b-0 md:border-b border-line-strong shadow-sheet pb-safe",
        className
      )}
    >
      <div className="flex justify-center pt-2.5 md:hidden">
        <div className="w-9 h-1 rounded-full bg-fg/20" />
      </div>

      <div className="px-5 pt-4 pb-3">
        <div className="text-eyebrow font-semibold uppercase tracking-wider text-fg-subtle">{eyebrow}</div>
        <p className="text-title font-semibold text-fg mt-1 truncate" dir="auto">{title}</p>
      </div>

      <div className="px-4 space-y-2">{children}</div>

      <div className="p-4">
        <Button variant="ghost" size="lg" className="w-full" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTION SHEET — modal sheet with backdrop
   Bottom sheet on phones, centered card on desktop.
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
        className="fixed inset-0 z-modal bg-scrim/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 inset-x-0 z-modal md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:fade-in-0 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <ActionSheetPanel {...panel} onCancel={() => onOpenChange(false)} />
      </div>
    </>,
    document.body
  )
}

"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Shelter } from "@/lib/types"
import { getShelterDisplayInfo } from "@/lib/shelter-display"
import { cn } from "@/lib/utils"

const REPORT_TYPES = [
  { value: "not_found", label: "Shelter not found / doesn't exist", labelHe: "המקלט לא נמצא / לא קיים" },
  { value: "locked", label: "Shelter is locked", labelHe: "המקלט נעול" },
  { value: "wrong_location", label: "Wrong location", labelHe: "מיקום שגוי" },
  { value: "poor_condition", label: "Shelter in poor condition", labelHe: "המקלט במצב לקוי" },
  { value: "other", label: "Other", labelHe: "אחר" },
]

interface ReportProblemDialogProps {
  shelter: Shelter
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ReportProblemDialog({
  shelter,
  open,
  onOpenChange,
}: ReportProblemDialogProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [details, setDetails] = useState("")
  const display = getShelterDisplayInfo(shelter)

  function buildMailtoUrl() {
    const reportTypeLabel =
      REPORT_TYPES.find((t) => t.value === selectedType)?.label ?? selectedType ?? "Not specified"

    const subject = encodeURIComponent(
      `Shelter Problem Report – ${display.primaryLine}`
    )

    const coords = shelter.coordinates
      ? `\nCoordinates: ${shelter.coordinates.lat}, ${shelter.coordinates.lng}`
      : ""

    const body = encodeURIComponent(
      `Problem type: ${reportTypeLabel}\n` +
        `Shelter: ${display.primaryLine}` +
        (display.secondaryLine ? `\nAddress: ${display.secondaryLine}` : "") +
        coords +
        (details ? `\n\nAdditional details:\n${details}` : "") +
        `\n\n---\nSent from Get Shelter (getshelter.app)`
    )

    return `mailto:horowitzisaac@gmail.com?subject=${subject}&body=${body}`
  }

  function handleSubmit() {
    window.open(buildMailtoUrl(), "_blank", "noopener,noreferrer")
    onOpenChange(false)
    // Reset state after submit
    setTimeout(() => {
      setSelectedType(null)
      setDetails("")
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-fg/10 text-fg max-w-md mx-auto rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-warn" aria-hidden="true" />
            <DialogTitle className="text-lg font-black text-center">
              דווח על בעיה / Report Problem
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-fg/55 text-xs leading-relaxed mt-1">
            עזור לנו לשפר את הנתונים · Help us improve the data
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 mt-4 space-y-4 scrollbar-thin">
          {/* Shelter being reported */}
          <div
            className="rounded-xl px-3 py-2.5 border border-fg/8 bg-fg/4"
          >
            <p className="text-tiny font-semibold text-fg/35 uppercase tracking-widest mb-1">
              מקלט / Shelter
            </p>
            <p className="text-sm font-bold text-fg leading-snug" dir="auto">
              {display.primaryLine}
            </p>
            {display.secondaryLine && (
              <p className="text-xs text-fg/40 mt-0.5 truncate" dir="auto">
                {display.secondaryLine}
              </p>
            )}
          </div>

          {/* Report type selection */}
          <div>
            <p className="text-xs font-semibold text-fg/60 mb-2">
              סוג הבעיה / Problem type
            </p>
            <div className="space-y-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setSelectedType(rt.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors border",
                    selectedType === rt.value ? "bg-warn/12 border-warn/35" : "bg-fg/4 border-fg/6"
                  )}
                  aria-pressed={selectedType === rt.value}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                      selectedType === rt.value ? "border-warn" : "border-fg/25"
                    )}
                  >
                    {selectedType === rt.value && (
                      <div
                        className="w-2 h-2 rounded-full bg-warn"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-snug",
                        selectedType === rt.value ? "text-warn-pale" : "text-fg/75"
                      )}
                    >
                      {rt.labelHe}
                    </p>
                    <p className="text-xs text-fg/35 mt-0.5">{rt.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional details */}
          <div>
            <p className="text-xs font-semibold text-fg/60 mb-2">
              פרטים נוספים (אופציונלי) / Additional details (optional)
            </p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="תאר את הבעיה / Describe the issue..."
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-fg placeholder-fg/20 resize-none outline-none focus:ring-1 focus:ring-warn/40 transition-shadow bg-fg/4 border border-fg/8"
              dir="auto"
            />
          </div>

          {/* Submit and cancel */}
          <div className="space-y-2 pb-2">
            <Button
              onClick={handleSubmit}
              disabled={!selectedType}
              className={cn(
                "w-full h-12 rounded-xl text-title font-bold disabled:opacity-40 border",
                selectedType ? "bg-warn/15 border-warn/35 text-warn-pale" : "bg-fg/4 border-fg/8 text-fg/40"
              )}
            >
              <AlertTriangle className="h-4 w-4 mr-2" aria-hidden="true" />
              שלח דיווח / Send Report
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3 rounded-xl text-body font-semibold text-fg/40 hover:text-fg/60 transition-colors bg-fg/4"
            >
              ביטול / Cancel
            </button>
          </div>

          <p className="text-tiny text-fg/20 text-center pb-2 leading-relaxed">
            הדיווח יישלח ל-horowitzisaac@gmail.com · Report sent to horowitzisaac@gmail.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

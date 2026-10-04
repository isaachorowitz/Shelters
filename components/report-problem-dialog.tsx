"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Bi } from "@/components/ui/bi"
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-warn" aria-hidden="true" />
            <DialogTitle>
              <Bi he="דווח על בעיה" en="Report Problem" />
            </DialogTitle>
          </div>
          <DialogDescription className="leading-relaxed">
            עזור לנו לשפר את הנתונים · Help us improve the data
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-5 scrollbar-thin">
          {/* Shelter being reported */}
          <div
            className="rounded-xl px-4 py-3 border border-line bg-surface-2"
          >
            <p className="text-eyebrow font-semibold text-fg-subtle uppercase tracking-wider mb-1">
              <Bi he="מקלט" en="Shelter" />
            </p>
            <p className="text-body font-semibold text-fg leading-snug" dir="auto">
              {display.primaryLine}
            </p>
            {display.secondaryLine && (
              <p className="text-label text-fg-subtle mt-0.5 truncate" dir="auto">
                {display.secondaryLine}
              </p>
            )}
          </div>

          {/* Report type selection */}
          <div>
            <p className="text-label font-semibold text-fg-muted mb-2">
              <Bi he="סוג הבעיה" en="Problem type" />
            </p>
            <div className="space-y-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setSelectedType(rt.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors border",
                    selectedType === rt.value ? "border-warn/50 bg-warn/10" : "bg-surface-2 border-line hover:border-line-strong"
                  )}
                  aria-pressed={selectedType === rt.value}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                      selectedType === rt.value ? "border-warn" : "border-fg-subtle"
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
                        "text-body font-semibold leading-snug",
                        selectedType === rt.value ? "text-warn" : "text-fg"
                      )}
                    >
                      {rt.labelHe}
                    </p>
                    <p className="text-label text-fg-subtle mt-0.5">{rt.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional details */}
          <div>
            <p className="text-label font-semibold text-fg-muted mb-2">
              <Bi he="פרטים נוספים (אופציונלי)" en="Additional details (optional)" />
            </p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="תאר את הבעיה / Describe the issue..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-base text-fg placeholder:text-fg-subtle resize-none bg-fg/6 border border-line focus:border-fg/30 focus:outline-none transition-colors"
              dir="auto"
            />
          </div>

          {/* Submit and cancel */}
          <div className="space-y-2 pb-2">
            <Button
              onClick={handleSubmit}
              disabled={!selectedType}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <Bi he="שלח דיווח" en="Send Report" />
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              <Bi he="ביטול" en="Cancel" />
            </Button>
          </div>

          <p className="text-caption text-fg-subtle text-center pb-2 leading-relaxed">
            הדיווח יישלח ל-horowitzisaac@gmail.com · Report sent to horowitzisaac@gmail.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

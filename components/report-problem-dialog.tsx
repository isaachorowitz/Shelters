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
      <DialogContent className="bg-neutral-950 border border-white/10 text-white max-w-md mx-auto rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <DialogTitle className="text-lg font-black text-center">
              דווח על בעיה / Report Problem
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-white/55 text-xs leading-relaxed mt-1">
            עזור לנו לשפר את הנתונים · Help us improve the data
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 mt-4 space-y-4 scrollbar-thin">
          {/* Shelter being reported */}
          <div
            className="rounded-xl px-3 py-2.5 border border-white/8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1">
              מקלט / Shelter
            </p>
            <p className="text-sm font-bold text-white leading-snug" dir="auto">
              {display.primaryLine}
            </p>
            {display.secondaryLine && (
              <p className="text-xs text-white/40 mt-0.5 truncate" dir="auto">
                {display.secondaryLine}
              </p>
            )}
          </div>

          {/* Report type selection */}
          <div>
            <p className="text-xs font-semibold text-white/60 mb-2">
              סוג הבעיה / Problem type
            </p>
            <div className="space-y-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setSelectedType(rt.value)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors"
                  style={{
                    background:
                      selectedType === rt.value
                        ? "rgba(251,191,36,0.12)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      selectedType === rt.value
                        ? "1px solid rgba(251,191,36,0.35)"
                        : "1px solid rgba(255,255,255,0.06)",
                  }}
                  aria-pressed={selectedType === rt.value}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{
                      borderColor:
                        selectedType === rt.value
                          ? "rgb(251,191,36)"
                          : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {selectedType === rt.value && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "rgb(251,191,36)" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{
                        color:
                          selectedType === rt.value
                            ? "rgb(253,230,138)"
                            : "rgba(255,255,255,0.75)",
                      }}
                    >
                      {rt.labelHe}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{rt.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional details */}
          <div>
            <p className="text-xs font-semibold text-white/60 mb-2">
              פרטים נוספים (אופציונלי) / Additional details (optional)
            </p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="תאר את הבעיה / Describe the issue..."
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 resize-none outline-none focus:ring-1 focus:ring-amber-400/40 transition-shadow"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              dir="auto"
            />
          </div>

          {/* Submit and cancel */}
          <div className="space-y-2 pb-2">
            <Button
              onClick={handleSubmit}
              disabled={!selectedType}
              className="w-full h-12 rounded-xl text-[15px] font-bold disabled:opacity-40"
              style={{
                background: selectedType
                  ? "rgba(251,191,36,0.15)"
                  : "rgba(255,255,255,0.04)",
                border: selectedType
                  ? "1px solid rgba(251,191,36,0.35)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: selectedType ? "rgb(253,230,138)" : "rgba(255,255,255,0.4)",
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2" aria-hidden="true" />
              שלח דיווח / Send Report
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-white/40 hover:text-white/60 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              ביטול / Cancel
            </button>
          </div>

          <p className="text-[10px] text-white/20 text-center pb-2 leading-relaxed">
            הדיווח יישלח ל-horowitzisaac@gmail.com · Report sent to horowitzisaac@gmail.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

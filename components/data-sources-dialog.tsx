"use client"

import { useState } from "react"
import { Info, Building2, Heart, Users, Code2, ExternalLink, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DATA_SOURCES } from "@/lib/types"

const TYPE_ICONS = {
  government: Building2,
  ngo: Heart,
  community: Users,
  commercial: Code2,
}

const TYPE_COLORS = {
  government: "text-info",
  ngo: "text-pink-400",
  community: "text-live",
  commercial: "text-warn",
}

const TYPE_LABELS = {
  government: "Government / ממשלתי",
  ngo: "NGO / עמותה",
  community: "Community / קהילתי",
  commercial: "Commercial / מסחרי",
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ""
  const [year, month] = dateStr.split("-")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[parseInt(month, 10) - 1]} ${year}`
}

const totalShelters = DATA_SOURCES.reduce((sum, s) => sum + (s.recordCount || 0), 0)

export default function DataSourcesDialog() {
  const [open, setOpen] = useState(false)

  const grouped = {
    government: DATA_SOURCES.filter((s) => s.type === "government"),
    ngo: DATA_SOURCES.filter((s) => s.type === "ngo"),
    community: DATA_SOURCES.filter((s) => s.type === "community"),
    commercial: DATA_SOURCES.filter((s) => s.type === "commercial"),
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-fg/35 hover:text-fg hover:bg-fg/10 rounded-full"
        aria-label="Data sources"
      >
        <Info className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-panel border border-fg/10 text-fg max-w-md mx-auto rounded-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-lg font-black text-center">
              Data Sources
            </DialogTitle>
            <DialogDescription className="text-center text-fg/55 text-xs leading-relaxed mt-1">
              {DATA_SOURCES.length} verified open sources · {totalShelters > 0 ? totalShelters.toLocaleString() : "7,577"} shelter records from Israeli government portals, NGOs, and community mapping projects.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-1 px-1 mt-3 space-y-4 scrollbar-thin">
            {(Object.entries(grouped) as [keyof typeof TYPE_LABELS, typeof DATA_SOURCES][]).map(
              ([type, sources]) =>
                sources.length > 0 && (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = TYPE_ICONS[type]
                        return <Icon className={`h-4 w-4 ${TYPE_COLORS[type]}`} aria-hidden="true" />
                      })()}
                      <h3 className={`text-sm font-bold ${TYPE_COLORS[type]}`}>
                        {TYPE_LABELS[type]}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {sources.map((source) => (
                        <div
                          key={source.id}
                          className="bg-fg/5 rounded-xl px-3 py-2.5 border border-fg/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-fg truncate">{source.name}</p>
                                {source.url && (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 text-fg/25 hover:text-fg/60 transition-colors no-min-h"
                                    aria-label={`Visit ${source.name} website`}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-fg/40" dir="rtl">{source.nameHe}</p>
                            </div>
                            {source.recordCount != null && (
                              <span className="text-xs font-bold text-fg/50 bg-fg/5 px-2 py-0.5 rounded-full flex-shrink-0">
                                {source.recordCount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-fg/50 mt-1 leading-relaxed">
                            {source.description}
                          </p>
                          {source.lastUpdated && (
                            <p className="text-tiny text-fg/25 mt-1">
                              Last updated: {formatDate(source.lastUpdated)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}

            {/* Report incorrect data */}
            <div className="bg-amber-950/30 border border-warn-muted/20 rounded-xl px-3 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warn mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-warn-soft mb-1">Found incorrect data?</p>
                  <p className="text-caption text-fg/40 leading-relaxed mb-2">
                    If a shelter is missing, locked, or has wrong coordinates, help us improve the data.
                  </p>
                  <a
                    href="mailto:horowitzisaac@gmail.com?subject=Data%20Issue%20Report%20-%20Shelter%20Now&body=Issue%20type%3A%20%5Bwrong%20location%20%2F%20shelter%20doesn%27t%20exist%20%2F%20locked%20%2F%20other%5D%0A%0AShelter%20address%20or%20location%3A%20%0A%0ADetails%3A%20"
                    className="inline-flex items-center gap-1.5 text-caption font-bold text-warn-soft hover:text-amber-200 transition-colors no-min-h"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Report Data Issue
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-fg/5 rounded-xl px-3 py-3 border border-fg/5 mt-2">
              <p className="text-xs text-fg/40 leading-relaxed text-center">
                Data is deduplicated and merged from {DATA_SOURCES.length} sources into {totalShelters > 0 ? totalShelters.toLocaleString() : "7,577"} unique shelter locations. Always verify shelter access in person during an emergency.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

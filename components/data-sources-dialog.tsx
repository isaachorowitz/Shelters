"use client"

import { useState } from "react"
import { Info, Building2, Heart, Users, Code2 } from "lucide-react"
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
  opensource: Code2,
}

const TYPE_COLORS = {
  government: "text-blue-400",
  ngo: "text-pink-400",
  community: "text-green-400",
  opensource: "text-amber-400",
}

const TYPE_LABELS = {
  government: "Government / ממשלתי",
  ngo: "NGO / עמותה",
  community: "Community / קהילתי",
  opensource: "Open Source / קוד פתוח",
}

export default function DataSourcesDialog() {
  const [open, setOpen] = useState(false)

  const grouped = {
    government: DATA_SOURCES.filter((s) => s.type === "government"),
    ngo: DATA_SOURCES.filter((s) => s.type === "ngo"),
    community: DATA_SOURCES.filter((s) => s.type === "community"),
    opensource: DATA_SOURCES.filter((s) => s.type === "opensource"),
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-white/35 hover:text-white hover:bg-white/10 rounded-full"
        aria-label="Data sources"
      >
        <Info className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-950 border border-white/10 text-white max-w-md mx-auto rounded-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-lg font-black text-center">
              Data Sources
            </DialogTitle>
            <DialogDescription className="text-center text-white/55 text-xs leading-relaxed mt-1">
              Shelter data from publicly available, open-licensed Israeli government portals, NGOs, and community mapping projects.
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
                          key={source.key}
                          className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-white">{source.name}</p>
                              <p className="text-xs text-white/40" dir="rtl">{source.nameHe}</p>
                            </div>
                          </div>
                          <p className="text-xs text-white/50 mt-1 leading-relaxed">
                            {source.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}

            <div className="bg-white/5 rounded-xl px-3 py-3 border border-white/5 mt-4">
              <p className="text-xs text-white/40 leading-relaxed text-center">
                {DATA_SOURCES.length} verified open sources · 2,939 shelter locations across Israel. Always verify shelter access in person during an emergency.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

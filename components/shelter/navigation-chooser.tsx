"use client"

import { Navigation, Map, MapPin } from "lucide-react"
import { ActionSheet, ActionSheetOption } from "@/components/ui/action-sheet"
import { Bi } from "@/components/ui/bi"
import type { NavApp } from "./navigation-links"

const PURPOSES = {
  /** Driving: Waze first, then Google Maps. */
  drive: {
    eyebrow: { he: "נווט עם", en: "Drive with" },
    apps: ["waze", "google"] as NavApp[],
  },
  /** Walking directions from the directory: every app. */
  directions: {
    eyebrow: { he: "נווט אל", en: "Get directions to" },
    apps: ["google", "apple", "waze"] as NavApp[],
  },
}

const APPS = {
  google: { label: "Google Maps", icon: Map, tone: "google" },
  apple: { label: "Apple Maps", icon: MapPin, tone: "neutral" },
  waze: { label: "Waze", icon: Navigation, tone: "waze" },
} as const

interface NavigationChooserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purpose: keyof typeof PURPOSES
  /** Shelter name or address shown as the sheet title. */
  title: string
  onSelect: (app: NavApp) => void
}

/** Action sheet that hands off to an external navigation app. */
export function NavigationChooser({ open, onOpenChange, purpose, title, onSelect }: NavigationChooserProps) {
  const p = PURPOSES[purpose]
  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      label="בחר אפליקציית ניווט / Choose navigation app"
      eyebrow={<Bi he={p.eyebrow.he} en={p.eyebrow.en} />}
      title={title}
    >
      {p.apps.map((app) => (
        <ActionSheetOption key={app} {...APPS[app]} onClick={() => onSelect(app)} />
      ))}
    </ActionSheet>
  )
}

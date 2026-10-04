import type { LucideIcon } from "lucide-react"
import { Shield, MapPin, BookOpen, Info, Heart, FileText, Lock, Mail } from "lucide-react"

export interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  desc?: string
}

export interface NavSection {
  label: string
  items: NavLink[]
}

/** Site navigation, shown in the menu drawer on every page. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "App",
    items: [
      { href: "/", label: "Shelter Finder", icon: Shield, desc: "Find the nearest shelter" },
      { href: "/shelters", label: "Directory", icon: MapPin, desc: "Browse shelters by city" },
    ],
  },
  {
    label: "Info",
    items: [
      { href: "/safety-guide", label: "Safety Guide", icon: BookOpen, desc: "What to do during an alarm" },
      { href: "/about", label: "About", icon: Info, desc: "Mission, data sources & more" },
      { href: "/contact", label: "Contact", icon: Mail, desc: "Report issues or get help" },
      { href: "/donate", label: "Donate", icon: Heart, desc: "Support the project" },
    ],
  },
  {
    label: "Legal",
    items: [
      { href: "/terms", label: "Terms of Service", icon: FileText },
      { href: "/privacy", label: "Privacy Policy", icon: Lock },
    ],
  },
]

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")
}

"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Shield, MapPin, BookOpen, Info, Heart, FileText, Lock, Mail, ChevronRight, ArrowLeft } from "lucide-react"

const NAV_SECTIONS = [
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
      { href: "/terms", label: "Terms of Service", icon: FileText, desc: "" },
      { href: "/privacy", label: "Privacy Policy", icon: Lock, desc: "" },
    ],
  },
]

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Close on route change
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open, onClose])

  // Escape key
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [open, onClose])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  if (!mounted) return null

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "288px",
          maxWidth: "85vw",
          background: "#0d0d0d",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.22s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: "56px",
          paddingTop: "env(safe-area-inset-top)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
            aria-label="Go to shelter finder"
          >
            <div style={{
              width: 28, height: 28,
              background: "#DC2626",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Shield style={{ width: 14, height: 14, color: "white" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 900, color: "white", letterSpacing: "0.05em" }}>
              GET SHELTER
            </span>
          </Link>
          <button
            onClick={onClose}
            className="no-min-h"
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%",
              color: "rgba(255,255,255,0.4)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Close menu"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Nav */}
        <nav
          style={{ flex: 1, overflowY: "auto", padding: "12px" }}
          aria-label="Navigation menu"
        >
          {/* Back to app CTA — shown on all non-home pages */}
          {pathname !== "/" && (
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 14,
                textDecoration: "none",
                background: "rgba(220,38,38,0.15)",
                border: "1px solid rgba(220,38,38,0.25)",
                color: "white",
                marginBottom: 16,
              }}
            >
              <div style={{
                width: 32, height: 32,
                background: "#DC2626",
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Shield style={{ width: 16, height: 16, color: "white" }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, display: "block" }}>Open Shelter Finder</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Find the nearest shelter now</span>
              </div>
              <ArrowLeft style={{ width: 14, height: 14, color: "rgba(220,38,38,0.7)", transform: "rotate(180deg)", flexShrink: 0 }} aria-hidden="true" />
            </Link>
          )}

          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                padding: "0 8px",
                marginBottom: 4,
              }}>
                {section.label}
              </p>
              {section.items.map(({ href, label, icon: Icon, desc }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      textDecoration: "none",
                      background: active ? "rgba(255,255,255,0.1)" : "transparent",
                      color: active ? "white" : "rgba(255,255,255,0.6)",
                      marginBottom: 2,
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    <Icon style={{
                      width: 16, height: 16, flexShrink: 0,
                      color: active ? "#f87171" : "rgba(255,255,255,0.3)",
                    }} aria-hidden="true" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, display: "block" }}>{label}</span>
                      {desc && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.2 }}>
                          {desc}
                        </span>
                      )}
                    </div>
                    {active && <ChevronRight style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} aria-hidden="true" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            getshelter.app · Free · No ads · No tracking
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="no-min-h"
        style={{
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          color: "rgba(255,255,255,0.5)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu style={{ width: 18, height: 18 }} />
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}

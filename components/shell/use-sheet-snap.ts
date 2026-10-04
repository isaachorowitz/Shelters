"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { SHEET_SNAPS, SHEET_PEEK_MIN_PX } from "@/lib/design/layout"

const SNAP_ORDER = [SHEET_SNAPS.peek, SHEET_SNAPS.half, SHEET_SNAPS.full]

function snapTo(fraction: number): number {
  const h = Math.round(window.innerHeight * fraction)
  return fraction === SHEET_SNAPS.peek ? Math.max(h, SHEET_PEEK_MIN_PX) : h
}

function snapHeights(): number[] {
  return SNAP_ORDER.map((s) => snapTo(s))
}

function nearestSnap(height: number): number {
  const snaps = snapHeights()
  return snaps.reduce((prev, cur) => (Math.abs(cur - height) < Math.abs(prev - height) ? cur : prev))
}

/**
 * Drag-to-snap behavior for the mobile bottom sheet.
 *
 * `height` is null until the component mounts, so the server render and the
 * first client render agree (the frame falls back to the peek height in CSS).
 */
export function useSheetSnap() {
  const [height, setHeight] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef(0)
  const startHRef = useRef(0)

  useEffect(() => {
    setHeight(snapTo(SHEET_SNAPS.peek))
  }, [])

  /** Collapse to the peek height (e.g. when new results arrive). */
  const snapToPeek = useCallback(() => setHeight(snapTo(SHEET_SNAPS.peek)), [])

  const current = () => height ?? snapTo(SHEET_SNAPS.peek)

  const clampHeight = (h: number) =>
    Math.max(snapTo(SHEET_SNAPS.peek), Math.min(snapTo(SHEET_SNAPS.full), h))

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    startHRef.current = current()
    setDragging(true)
  }, [height]) // eslint-disable-line react-hooks/exhaustive-deps

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    const dy = startYRef.current - e.touches[0].clientY
    setHeight(clampHeight(startHRef.current + dy))
  }, [dragging]) // eslint-disable-line react-hooks/exhaustive-deps

  const onTouchEnd = useCallback(() => {
    setDragging(false)
    setHeight(nearestSnap(current()))
  }, [height]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tap the handle: cycle through snaps
  const onClick = useCallback(() => {
    const snaps = snapHeights()
    const cur = current()
    setHeight(snaps.find((s) => s > cur + 10) ?? snaps[0])
  }, [height]) // eslint-disable-line react-hooks/exhaustive-deps

  const isPeek = height === null || height <= snapTo(SHEET_SNAPS.peek) * 1.1
  const isFull = height !== null && height >= snapTo(SHEET_SNAPS.full) * 0.95

  return {
    height,
    dragging,
    isPeek,
    isFull,
    snapToPeek,
    handleProps: { onTouchStart, onTouchMove, onTouchEnd, onClick },
  }
}

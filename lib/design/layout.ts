/**
 * Layout values that JavaScript needs. CSS-only values live in
 * styles/tokens.css; keep the two in step when one changes.
 */

/** Mobile bottom sheet snap points, as a fraction of viewport height. */
export const SHEET_SNAPS = {
  /** Collapsed: handle plus the first full card with its action buttons. */
  peek: 0.44,
  /** Half: a couple of cards. */
  half: 0.6,
  /** Full: almost the whole screen. */
  full: 0.85,
} as const

export type SheetSnap = keyof typeof SHEET_SNAPS

/** Height of the fixed top bar, excluding the safe-area inset. */
export const TOPBAR_HEIGHT = 56

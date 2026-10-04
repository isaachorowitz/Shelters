import type { ReactNode } from "react"

interface AppShellProps {
  /** Fixed top bar (TopBar variant="app"). */
  topBar: ReactNode
  /** Desktop column left of the map (Sidebar). */
  sidebar?: ReactNode
  /** Full-screen layers above everything: directory, share dialog. */
  overlays?: ReactNode
  /** id the skip link jumps to. */
  skipTargetId?: string
  /** The map and anything floating over it, including the phone sheet. */
  children: ReactNode
}

/**
 * Full-viewport layout for the shelter finder:
 *
 *   ┌──────────── top bar ────────────┐
 *   │ sidebar │          map          │   desktop (md and up)
 *   └─────────┴───────────────────────┘
 *
 *   ┌──────── top bar ────────┐
 *   │           map           │          phone
 *   │╭──── bottom sheet ─────╮│
 *   └─────────────────────────┘
 */
export function AppShell({ topBar, sidebar, overlays, skipTargetId = "shelter-list-content", children }: AppShellProps) {
  return (
    <div className="flex flex-col bg-bg h-dvh overflow-hidden">
      <a
        href={`#${skipTargetId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-skip-link focus:bg-brand focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold"
      >
        Skip to shelter list
      </a>

      {topBar}

      {/* Body sits below the fixed top bar, including the safe-area inset */}
      <div className="flex flex-1 overflow-hidden pt-[calc(var(--gs-topbar-h)+env(safe-area-inset-top)+1px)]">
        {sidebar}
        <main className="flex-1 relative overflow-hidden" role="main">
          {children}
        </main>
      </div>

      {overlays}
    </div>
  )
}

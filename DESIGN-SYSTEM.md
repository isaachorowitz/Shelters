# Get Shelter design system

Refined dark. The UI is one responsive Next.js app: phones and desktops run the same components, and layout switches at Tailwind's `md` breakpoint (768px). The job of every screen is to get someone to the nearest shelter in one tap, so the nearest shelter always shows a single large Navigate button that opens walking directions directly.

## Where things live

| Layer | Path | What it holds |
|---|---|---|
| Tokens | `styles/tokens.css` | Colors, layout sizes, radius, motion, as CSS variables |
| Utilities | `tailwind.config.ts` | Tokens as classes: `bg-surface-2`, `text-fg-muted`, `border-line`, `bg-brand/15`, `text-title`, `shadow-sheet` |
| Fonts | `app/layout.tsx` | Geist (Latin) and Heebo (Hebrew), combined per glyph in the `sans` stack |
| Primitives | `components/ui/` | Button, IconButton, Chip, Bi, SearchField, ActionSheet, EmptyState, Skeleton, Spinner, Dialog |
| Shell | `components/shell/` | AppShell, TopBar, Brand, DonateButton, NavDrawer (with EmergencyNumbers), Sidebar, BottomSheet, useSheetSnap |
| Shelter | `components/shelter/` | ShelterCard, ShelterList, NearbySidebar, NearbySheet, NearbyHeader, NavigationChooser, small parts |
| Search | `components/search/` | AddressSearch, AddressResults, ActiveLocationPill, useAddressSearch |
| Map overlays | `components/map/` | MapTopStack, LocateButton, LocatingPill, UpdateLocationButton, OutsideIsraelBanner, LocationErrorCard, PermissionPrompt |
| Map canvas colors | `lib/design/map-colors.ts` | Marker and route colors (canvas cannot read CSS variables) |
| Emergency numbers | `lib/emergency.ts` | 100, 101, 102, 104; verified against gov.il, change only from an official source |
| Entry point | `components/design-system.ts` | Exports every component above |
| Catalog | `/kit` (dev only) | Every component in every state from sample data; 404 in production |

Import the library as `@/components/design-system`, never `@/components`: the bundler resolves that bare path to the shadcn `components.json` file.

## How the screens are built

```
Desktop (md and up)                       Phone (below md)
┌──────────── TopBar ────────────┐        ┌──────── TopBar ────────┐  search collapses to an icon
│ NearbySidebar │  MapTopStack    │        │      MapTopStack       │  status pills at the top
│  nearest card │      map        │        │          map           │
│  ranked rows  │       ⌖ zoom    │        │                     ⌖  │  locate rides on the sheet
│  Browse all   │                 │        │╭───── NearbySheet ────╮│  peek shows the whole nearest card
└───────────────┴─────────────────┘        └────────────────────────┘
```

`app/page.tsx` owns state (location, shelters, search, dialogs) and passes it down; `AppShell` owns the layout. The menu drawer, directory, share dialog, and navigation chooser open over everything. Content pages (`app/(static)/*`) use `<TopBar variant="site">`, which keeps Find shelter visible on every page.

## Rules

1. **No raw colors.** Use token classes, never `bg-red-600`, `rgba(...)`, hex, or `style={{ color }}`. `text-white` only on solid `bg-brand`. Add a token to `styles/tokens.css` and `tailwind.config.ts` when nothing fits.
2. **Readable text is AA.** Use `text-fg`, `text-fg-muted`, or `text-fg-subtle` for anything someone reads. Lower `fg` opacities are decoration only.
3. **Type scale only.** `text-eyebrow` 11 (uppercase labels), `caption` 12, `label` 13, `body` 15, `title` 17, `heading` 22, `display` 30. Each carries a line height; `leading-*` still overrides. Nothing under 11px. Inputs use 16px (`text-base`) so iOS does not zoom.
4. **Both languages, always.** Short bilingual labels use `<Bi he="…" en="…" />` (Hebrew first, English quieter, proper `lang` attributes). There is no language switch on purpose: nobody should hunt for a toggle during a siren.
5. **One primary per surface.** `Button variant="primary"` is for the action that matters (Navigate, Allow location). Everything else is `secondary`, `ghost`, or `outline`.
6. **Navigate is one tap.** Walking directions open straight into Google Maps from the nearest card. Choosers are only for driving.
7. **Presentational components render from props alone**: no `window`, fetches, or portals. Behavior lives in a hook or a thin wrapper (`useSheetSnap` with `BottomSheet`, `useAddressSearch` with `AddressSearch`, `NavDrawer` around `NavDrawerPanel`, `ActionSheet` around `ActionSheetPanel`). That is what lets `/kit` and Claude Design render every component.
8. Inline `style` is only for runtime values (the sheet's drag height).
9. Every new component goes in `components/design-system.ts` and gets a specimen in `app/kit/kit.tsx`.

## Phone sheet

`lib/design/layout.ts` sets the snaps: peek 42% of the screen but never under 316px, half 60%, full 85%. Peek must show the whole nearest card including Navigate; check 390×844, 375×667, and 320×568 after any change to the card.

## Redesigning with Claude Design

1. In Claude Code, from this repo, run `/design-sync` to upload the tokens and components to a design-system project on claude.ai/design.
2. Design on the Claude Design canvas from that design system.
3. Hand the design off to Claude Code; changes land in `styles/tokens.css` and the existing components, verified against `/kit` at phone and desktop widths.
4. Run `/design-sync` again so Claude Design matches the shipped code.

## Known follow-ups

- Leaflet popups are HTML strings in `components/map-view.tsx`, styled by `.gs-popup__*` classes in `app/globals.css`.
- The city pages show the raw type key `parking` in one chip and "0 neighborhoods" when a city has none; both come from the data layer.

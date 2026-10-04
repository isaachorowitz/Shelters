# Get Shelter design system

The UI is one responsive Next.js app. Phones and desktops run the same components; layout switches at Tailwind's `md` breakpoint (768px), and a few labels collapse at `sm` (640px).

## Where things live

| Layer | Path | What it holds |
|---|---|---|
| Tokens | `styles/tokens.css` | Every color, layout size, radius, and motion value, as CSS variables |
| Utilities | `tailwind.config.ts` | Tokens exposed as classes: `bg-brand`, `text-fg/40`, `border-fg/8`, `text-caption`, `z-header`, `shadow-sheet` |
| Primitives | `components/ui/` | Button, IconButton, Chip, StatusPill, Spinner, EmptyState, SearchField, ActionSheet, Dialog |
| Shell | `components/shell/` | AppShell, TopBar, Brand, DonateButton, NavDrawer, Sidebar, BottomSheet, useSheetSnap |
| Shelter | `components/shelter/` | ShelterCard and its parts, ShelterList, NearbySidebar, NearbySheet, NavigationChooser |
| Search | `components/search/` | AddressSearch, AddressResults, ActiveLocationPill, useAddressSearch |
| Map overlays | `components/map/` | LocateButton, LocatingPill, UpdateLocationButton, OutsideIsraelBanner, LocationErrorCard, PermissionPrompt |
| Map canvas colors | `lib/design/map-colors.ts` | Marker and route colors (canvas cannot read CSS variables) |
| Entry point | `components/design-system.ts` | Exports every component above |
| Catalog | `/kit` (dev only) | Every component in every state from sample data; 404 in production |

Import the library as `@/components/design-system`, never `@/components`: the bundler resolves that bare path to the shadcn `components.json` file.

## How the screens are built

```
Desktop (md and up)                       Phone (below md)
┌──────────── TopBar ────────────┐        ┌──────── TopBar ────────┐
│ NearbySidebar │      map        │        │          map           │
│  ShelterList  │  map overlays   │        │      map overlays      │
│               │                 │        │╭───── NearbySheet ────╮│
└───────────────┴─────────────────┘        └────────────────────────┘
```

`app/page.tsx` owns state (location, shelters, search, dialogs) and passes it down. `AppShell` owns the layout. The menu drawer, directory, share dialog, and navigation chooser open over everything.

Content pages (`app/(static)/*`) use `<TopBar variant="site">` and the same menu drawer.

## Rules

1. No raw colors. Use a token class (`bg-brand/15`), never `bg-red-600`, `rgba(...)`, hex, or `style={{ color }}`. Add a token to `styles/tokens.css` and `tailwind.config.ts` when nothing fits.
2. No pixel font sizes. Use the scale: `text-nano` 8, `micro` 9, `tiny` 10, `caption` 11, `label` 12, `ui` 13, `body` 14, `title` 15, `heading` 16, `display` 22. These set size only, never line height.
3. Text hierarchy on dark is `text-fg` at an opacity step (`/90`, `/70`, `/60`, `/50`, `/40`, `/30`, `/25`, `/20`).
4. Presentational components render from props alone: no `window`, fetches, or portals. Behavior lives in a hook or a thin wrapper (`useSheetSnap` with `BottomSheet`, `useAddressSearch` with `AddressSearch`, `NavDrawer` around `NavDrawerPanel`, `ActionSheet` around `ActionSheetPanel`). This is what lets `/kit` and Claude Design render every component.
5. Inline `style` is only for values computed at runtime (the bottom sheet's drag height).
6. Every new component goes in `components/design-system.ts` and gets a specimen in `app/kit/kit.tsx`.

## Redesigning with Claude Design

1. In Claude Code, from this repo, run `/design-sync`. It uploads this design system (tokens, components) into a design-system project on claude.ai/design.
2. On claude.ai/design, create a design or prototype from that design system and iterate on the top bar, sidebar, bottom sheet, and cards on the canvas.
3. Hand the finished design off to Claude Code. The implementation lands here: token changes in `styles/tokens.css`, structural changes inside the existing components, verified against `/kit` at phone and desktop widths.
4. Run `/design-sync` again so Claude Design's copy matches the shipped code.

## Known follow-ups for the redesign

- Copy is bilingual as `"עברית / English"` strings inside components; a redesign that separates languages should move them to a strings file first.
- `app/globals.css` forces a 44px minimum height on every `button` and `a`, with a `no-min-h` escape class. Touch-target sizing should move into the primitives.
- Leaflet popups are built as HTML strings in `components/map-view.tsx` and use literal colors.

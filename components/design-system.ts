/**
 * Get Shelter component library: the single entry point for the design
 * system. Claude Design (via /design-sync) and the /kit catalog read from here.
 *
 *   styles/tokens.css        color, layout, radius, motion tokens
 *   tailwind.config.ts       tokens exposed as utilities (bg-brand, text-fg/40, text-caption)
 *   components/ui/*          primitives with no app knowledge
 *   components/shell/*       app frame: top bar, menu drawer, sidebar, bottom sheet
 *   components/shelter/*     shelter cards, list, nearby panels, navigation chooser
 *   components/search/*      address search
 *   components/map/*         controls and messages that float over the map
 */

// Primitives
export { Button, buttonVariants } from "./ui/button"
export { IconButton } from "./ui/icon-button"
export { Chip } from "./ui/chip"
export { StatusPill } from "./ui/status-pill"
export { Spinner } from "./ui/spinner"
export { EmptyState } from "./ui/empty-state"
export { SearchField } from "./ui/search-field"
export { ActionSheet, ActionSheetPanel, ActionSheetOption } from "./ui/action-sheet"
export { Badge } from "./ui/badge"
export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog"

// Shell
export { AppShell } from "./shell/app-shell"
export { TopBar } from "./shell/top-bar"
export { Brand, BrandMark } from "./shell/brand"
export { DonateButton } from "./shell/donate-button"
export { NavDrawer, NavDrawerPanel, NavItem, BackToFinderLink, MenuButton } from "./shell/nav-drawer"
export { Sidebar } from "./shell/sidebar"
export { BottomSheet } from "./shell/bottom-sheet"
export { useSheetSnap } from "./shell/use-sheet-snap"

// Shelter
export { ShelterCard } from "./shelter/shelter-card"
export { ShelterList } from "./shelter/shelter-list"
export { NearbySidebar, NearbySheet, NearbySheetSummary, SharePill, BrowseAllButton } from "./shelter/nearby-panel"
export { RankBadge } from "./shelter/rank-badge"
export { DistanceReadout } from "./shelter/distance-readout"
export { ConfidenceBadge } from "./shelter/confidence-badge"
export { CapacityTag } from "./shelter/capacity-tag"
export { TravelModeButton } from "./shelter/travel-mode-button"
export { NavigationChooser } from "./shelter/navigation-chooser"

// Search
export { AddressSearch, AddressResults, ActiveLocationPill } from "./search/address-search"

// Map overlays
export {
  LocateButton,
  LocatingPill,
  UpdateLocationButton,
  OutsideIsraelBanner,
  LocationErrorCard,
  PermissionPrompt,
} from "./map/map-overlays"

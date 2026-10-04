"use client"

import type { ReactNode } from "react"
import { MapPin, Shield, X, Info, Menu } from "lucide-react"
import { SAMPLE_SHELTERS } from "@/lib/design/fixtures"
import {
  ActionSheetOption,
  ActionSheetPanel,
  ActiveLocationPill,
  AddressResults,
  BottomSheet,
  Brand,
  BrowseAllButton,
  CapacityTag,
  Chip,
  ConfidenceBadge,
  DistanceReadout,
  DonateButton,
  EmptyState,
  IconButton,
  LocateButton,
  LocatingPill,
  LocationErrorCard,
  NavDrawerPanel,
  NearbySheetSummary,
  NearbySidebar,
  OutsideIsraelBanner,
  PermissionPrompt,
  RankBadge,
  SearchField,
  ShelterCard,
  ShelterList,
  StatusPill,
  TopBar,
  TravelModeButton,
  UpdateLocationButton,
} from "@/components/design-system"
import { Map as MapIcon, Navigation } from "lucide-react"


/* Dev-only catalog of every design-system component in every state. */

const COLOR_TOKENS = [
  ["bg", "App background"],
  ["fg", "Text and icons"],
  ["surface-1", "Bottom sheet"],
  ["surface-2", "Drawer, popovers"],
  ["surface-3", "Action sheet"],
  ["surface-4", "Shelter card"],
  ["panel", "Dialogs, directory"],
  ["brand", "Primary red"],
  ["brand-bright", "Red icons, hover"],
  ["brand-strong", "Pressed red"],
  ["brand-soft", "Red text"],
  ["brand-softer", "Closest badge text"],
  ["brand-deep", "Dark red panels"],
  ["live", "LIVE status"],
  ["warn", "Warnings, report"],
  ["warn-strong", "Update button"],
  ["warn-deep", "Outside Israel"],
  ["warn-pin", "Searched address"],
  ["info", "Locate, drive"],
  ["info-strong", "User location"],
  ["caution", "Medium confidence"],
  ["danger-deep", "Location error"],
  ["walk", "Walk mode"],
  ["run", "Run mode"],
  ["drive", "Drive mode"],
  ["rank-1", "Rank 1"],
  ["rank-2", "Rank 2"],
  ["rank-3", "Rank 3"],
  ["rank-4", "Rank 4"],
  ["rank-5", "Rank 5+"],
  ["waze", "Waze"],
  ["google", "Google Maps"],
] as const

const TYPE_SCALE = [
  ["nano", "8px"],
  ["micro", "9px"],
  ["tiny", "10px"],
  ["caption", "11px"],
  ["label", "12px"],
  ["ui", "13px"],
  ["body", "14px"],
  ["title", "15px"],
  ["heading", "16px"],
  ["display", "22px"],
] as const

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <h2 className="text-2xl font-black text-fg mb-6 border-b border-fg/10 pb-3">{title}</h2>
      <div className="space-y-10">{children}</div>
    </section>
  )
}

function Specimen({ name, note, children, className }: { name: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-bold text-fg font-mono">{name}</p>
        {note && <p className="text-xs text-fg/50 mt-0.5 max-w-2xl">{note}</p>}
      </div>
      <div className={className ?? "rounded-2xl border border-fg/10 bg-bg p-5"}>{children}</div>
    </div>
  )
}

/** Contains position:fixed children (a transformed ancestor becomes their containing block). */
function Frame({ height, width, children, className }: { height: number; width?: number; children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-fg/10 bg-[#141414] [transform:translateZ(0)] ${className ?? ""}`}
      style={{ height, width }}
    >
      {children}
    </div>
  )
}

const noop = undefined

export default function Kit() {
  const [first, second, third] = SAMPLE_SHELTERS

  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden bg-bg text-fg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-12">
          <p className="text-caption font-bold uppercase tracking-widest text-brand-soft">Get Shelter</p>
          <h1 className="text-4xl font-black mt-1">Component kit</h1>
          <p className="text-sm text-fg/60 mt-3 max-w-2xl">
            Every design-system component in every state, rendered from sample data. Phone layouts switch at the
            Tailwind <code className="font-mono">sm</code> (640px) and <code className="font-mono">md</code> (768px)
            breakpoints, so narrow the window or open this page on a phone to see them. Tokens live in{" "}
            <code className="font-mono">styles/tokens.css</code>.
          </p>
          <nav className="flex flex-wrap gap-2 mt-6 text-xs font-semibold">
            {["tokens", "shell", "shelter", "search", "map", "primitives"].map((id) => (
              <a key={id} href={`#${id}`} className="no-min-h px-3 py-1.5 rounded-full bg-fg/8 hover:bg-fg/15 capitalize">
                {id}
              </a>
            ))}
          </nav>
        </header>

        {/* ── TOKENS ───────────────────────────────────────── */}
        <Section id="tokens" title="Tokens">
          <Specimen name="Colors" note="Use with Tailwind opacity modifiers: bg-brand/15, text-fg/40, border-fg/8.">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {COLOR_TOKENS.map(([token, use]) => (
                <div key={token} className="rounded-xl border border-fg/10 overflow-hidden">
                  <div className="h-14" style={{ background: `rgb(var(--gs-${token}))` }} />
                  <div className="px-2.5 py-2">
                    <p className="text-label font-bold font-mono">{token}</p>
                    <p className="text-tiny text-fg/50">{use}</p>
                  </div>
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen name="Type scale" note="Font sizes only; line height comes from the surrounding leading class.">
            <div className="space-y-2">
              {TYPE_SCALE.map(([name, px]) => (
                <div key={name} className="flex items-baseline gap-4">
                  <span className="w-40 shrink-0 text-label font-mono text-fg/50">
                    text-{name} <span className="text-fg/30">{px}</span>
                  </span>
                  <span className={`text-${name} font-semibold`}>מקלטים קרובים / Nearest shelters</span>
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen name="Foreground opacity ladder" note="Text hierarchy on dark surfaces is fg at an opacity step.">
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              {[100, 90, 70, 60, 50, 40, 30, 25, 20].map((o) => (
                <span key={o} style={{ color: `rgb(var(--gs-fg) / ${o / 100})` }}>
                  fg/{o}
                </span>
              ))}
            </div>
          </Specimen>
        </Section>

        {/* ── SHELL ────────────────────────────────────────── */}
        <Section id="shell" title="Shell: top bar, menu, sidebar, bottom sheet">
          <Specimen
            name='<TopBar variant="app">'
            note="Shelter finder. Fixed, full width, address search in the middle. Below sm the wordmark and the Donate label hide."
            className=""
          >
            <Frame height={72}>
              <TopBar>
                <SearchField placeholder="חפש כתובת... / Search address..." readOnly />
              </TopBar>
            </Frame>
          </Specimen>

          <Specimen name='<TopBar variant="site">' note="Content pages. Sticky, centered column, logo links home." className="">
            <Frame height={72}>
              <TopBar variant="site" />
            </Frame>
          </Specimen>

          <Specimen name="<Brand>" note="Stacked (top bars), collapse on phones (app bar), inline (menu drawer).">
            <div className="flex flex-wrap items-center gap-10">
              <Brand />
              <Brand collapseOnMobile />
              <Brand wordmark="inline" />
            </div>
          </Specimen>

          <Specimen name="<NavDrawerPanel>" note="Menu drawer contents. On any page except the finder it opens with a back-to-finder card." className="">
            <div className="flex flex-wrap gap-6">
              <Frame height={760} width={288}>
                <NavDrawerPanel pathname="/" className="h-full" />
              </Frame>
              <Frame height={760} width={288}>
                <NavDrawerPanel pathname="/about" className="h-full" />
              </Frame>
            </div>
          </Specimen>

          <Specimen name="<NearbySidebar>" note="Desktop (md and up): the column left of the map." className="">
            <Frame height={720} width={340}>
              <NearbySidebar
                className="flex h-full"
                shelters={SAMPLE_SHELTERS}
                isLoading={false}
                hasLocationError={false}
                onOpenShare={noop}
                onOpenDirectory={noop}
              />
            </Frame>
          </Specimen>

          <Specimen
            name="<BottomSheet> + <NearbySheetSummary>"
            note="Phone (below md): drags between peek (44%), half (60%), and full (85%). Shown at peek and full."
            className=""
          >
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Peek", h: 371, share: false },
                { label: "Full", h: 717, share: true },
              ].map(({ label, h, share }) => (
                <div key={label}>
                  <p className="text-tiny font-bold uppercase tracking-widest text-fg/40 mb-2">{label}</p>
                  <Frame height={844} width={390}>
                    <BottomSheet
                      label="Shelter list"
                      height={h}
                      summary={<NearbySheetSummary shelters={SAMPLE_SHELTERS.slice(0, 3)} isLoading={false} showShare={share} onShare={() => {}} />}
                    >
                      <div className="px-3 py-3">
                        <ShelterList shelters={SAMPLE_SHELTERS.slice(0, 3)} isLoading={false} hasLocationError={false} />
                      </div>
                      <div className="px-3 pb-4">
                        <BrowseAllButton onClick={() => {}} />
                      </div>
                    </BottomSheet>
                  </Frame>
                </div>
              ))}
            </div>
          </Specimen>
        </Section>

        {/* ── SHELTER ──────────────────────────────────────── */}
        <Section id="shelter" title="Shelter">
          <Specimen name='<ShelterCard variant="nearby">' note="Closest (rank 1), a regular card, and one with a low-confidence source.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-start">
              <ShelterCard shelter={first} rank={1} isClosest onShare={() => {}} />
              <ShelterCard shelter={second} rank={2} onShare={() => {}} />
              <ShelterCard shelter={third} rank={3} />
            </div>
          </Specimen>
          <Specimen name='<ShelterCard variant="directory">' note="Compact row with map, directions, and report actions.">
            <div className="grid gap-3 sm:grid-cols-2">
              <ShelterCard shelter={first} variant="directory" onShowOnMap={() => {}} />
              <ShelterCard shelter={third} variant="directory" onShowOnMap={() => {}} />
            </div>
          </Specimen>
          <Specimen name="<ShelterList> states" note="Loading, location needed, and no results.">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-1"><ShelterList shelters={[]} isLoading hasLocationError={false} /></div>
              <div className="rounded-xl bg-surface-1"><ShelterList shelters={[]} isLoading={false} hasLocationError /></div>
              <div className="rounded-xl bg-surface-1"><ShelterList shelters={[]} isLoading={false} hasLocationError={false} /></div>
            </div>
          </Specimen>
          <Specimen name="<TravelModeButton>" note="Walk, run, drive stretch; share and report are fixed squares.">
            <div className="flex gap-1.5 max-w-sm">
              <TravelModeButton mode="walk" etaMinutes={4} aria-label="Walk" />
              <TravelModeButton mode="run" etaMinutes={2} aria-label="Run" />
              <TravelModeButton mode="drive" aria-label="Drive" />
              <TravelModeButton mode="share" aria-label="Share" />
              <TravelModeButton mode="report" aria-label="Report" />
            </div>
          </Specimen>
          <Specimen name="<RankBadge> · <DistanceReadout> · <Chip> · <ConfidenceBadge> · <CapacityTag>">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => <RankBadge key={r} rank={r} />)}
              </div>
              <DistanceReadout text="64m" />
              <DistanceReadout text="1.4km" />
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="highlight" size="xs">המקלט הקרוב / Closest Shelter</Chip>
                <Chip tone="brand">מקלט ציבורי / Public Shelter</Chip>
                <Chip tone="neutral">128</Chip>
              </div>
              <div className="flex flex-col gap-1">
                <ConfidenceBadge confidence="high" />
                <ConfidenceBadge confidence="medium" />
                <ConfidenceBadge confidence="low" />
              </div>
              <CapacityTag capacity={240} className="text-caption text-fg/25" />
            </div>
          </Specimen>
          <Specimen name="<NavigationChooser> (ActionSheetPanel)" note="Hand-off to a maps app. Drive offers Waze and Google; directions adds Apple Maps." className="">
            <div className="flex flex-wrap gap-6 items-end">
              <div className="w-[390px] max-w-full">
                <ActionSheetPanel eyebrow="נווט עם / Drive with" title={first.address ?? ""}>
                  <ActionSheetOption label="Waze" icon={Navigation} tone="waze" />
                  <ActionSheetOption label="Google Maps" icon={MapIcon} tone="google" />
                </ActionSheetPanel>
              </div>
              <div className="w-[390px] max-w-full">
                <ActionSheetPanel eyebrow="נווט אל / Get Directions to" title={first.address ?? ""}>
                  <ActionSheetOption label="Google Maps" icon={MapIcon} tone="google" />
                  <ActionSheetOption label="Apple Maps" icon={MapPin} tone="neutral" />
                  <ActionSheetOption label="Waze" icon={Navigation} tone="waze" />
                </ActionSheetPanel>
              </div>
            </div>
          </Specimen>
        </Section>

        {/* ── SEARCH ───────────────────────────────────────── */}
        <Section id="search" title="Search">
          <Specimen name="<SearchField>" note="Empty, typed, and searching.">
            <div className="grid gap-3 sm:grid-cols-3">
              <SearchField placeholder="חפש כתובת... / Search address..." readOnly />
              <SearchField value="Dizengoff 50" onClear={() => {}} readOnly />
              <SearchField value="Dizengoff" loading readOnly />
            </div>
          </Specimen>
          <Specimen name="<AddressResults> · <ActiveLocationPill>" note="Suggestions under the field, and the orange pill while a searched address replaces GPS." className="">
            <div className="grid gap-6 sm:grid-cols-2">
              <Frame height={300}>
                <div className="relative m-4">
                  <SearchField value="Dizengoff" onClear={() => {}} readOnly />
                  <AddressResults
                    onSelect={() => {}}
                    suggestions={[
                      { id: 1, label: "Dizengoff Street 50, Tel Aviv-Yafo" },
                      { id: 2, label: "Dizengoff Center, Tel Aviv-Yafo" },
                      { id: 3, label: "Dizengoff Square, Tel Aviv-Yafo" },
                    ]}
                  />
                </div>
              </Frame>
              <Frame height={300}>
                <div className="relative m-4">
                  <SearchField value="Dizengoff 50, Tel Aviv" onClear={() => {}} readOnly />
                  <ActiveLocationPill label="Dizengoff 50, Tel Aviv" onReturnToMe={() => {}} onClear={() => {}} />
                </div>
              </Frame>
            </div>
          </Specimen>
        </Section>

        {/* ── MAP OVERLAYS ─────────────────────────────────── */}
        <Section id="map" title="Map overlays">
          <Specimen name="<LocateButton> · <LocatingPill> · <UpdateLocationButton> · <OutsideIsraelBanner>" className="">
            <div className="grid gap-6 sm:grid-cols-2">
              <Frame height={160}>
                <LocateButton />
                <LocatingPill />
              </Frame>
              <Frame height={160}>
                <UpdateLocationButton />
                <OutsideIsraelBanner />
              </Frame>
            </div>
          </Specimen>
          <Specimen name="<LocationErrorCard>" className="">
            <Frame height={120}>
              <LocationErrorCard message="Location took too long. Tap to try again." />
            </Frame>
          </Specimen>
          <Specimen name="<PermissionPrompt>" note="Covers the map when location permission is denied." className="">
            <Frame height={560} width={390}>
              <PermissionPrompt search={<SearchField placeholder="חפש כתובת... / Search address..." readOnly />} />
            </Frame>
          </Specimen>
        </Section>

        {/* ── PRIMITIVES ───────────────────────────────────── */}
        <Section id="primitives" title="Primitives">
          <Specimen name="<IconButton>" note="ghost on the chrome, glass over the map. Sizes xs, sm, md, lg.">
            <div className="flex items-center gap-4">
              <IconButton label="Info" size="xs" className="text-fg/35"><Info /></IconButton>
              <IconButton label="Close"><X /></IconButton>
              <IconButton label="Menu" size="md" className="text-fg/50"><Menu /></IconButton>
              <IconButton label="Shield" size="lg" tone="glass" className="text-info"><Shield /></IconButton>
            </div>
          </Specimen>
          <Specimen name="<StatusPill> · <DonateButton>">
            <div className="flex items-center gap-4">
              <StatusPill />
              <DonateButton />
            </div>
          </Specimen>
          <Specimen name="<EmptyState>">
            <div className="grid gap-3 sm:grid-cols-3">
              <EmptyState loading title="Loading" description="With a spinner" />
              <EmptyState tone="warn" icon={MapPin} title="Warn tone" description="Needs attention" />
              <EmptyState icon={Shield} title="Neutral tone" description="Nothing here" />
            </div>
          </Specimen>
        </Section>
      </div>
    </div>
  )
}

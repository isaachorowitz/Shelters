"use client"

import type { ReactNode } from "react"
import { MapPin, Shield, X, Menu, Search, Navigation, Map as MapIcon, Share2, Heart } from "lucide-react"
import { SAMPLE_SHELTERS } from "@/lib/design/fixtures"
import {
  ActionSheetOption,
  ActionSheetPanel,
  ActiveLocationPill,
  AddressResults,
  Bi,
  BottomSheet,
  Brand,
  BrowseAllButton,
  Button,
  CapacityTag,
  Chip,
  ConfidenceBadge,
  DistanceReadout,
  EmergencyNumbers,
  EmptyState,
  IconButton,
  LocateButton,
  LocatingPill,
  LocationErrorCard,
  MapTopStack,
  NavDrawerPanel,
  NearbyHeader,
  NearbySidebar,
  OutsideIsraelBanner,
  PermissionPrompt,
  RankBadge,
  SearchField,
  ShelterCard,
  ShelterList,
  ShelterListSkeleton,
  TopBar,
  UpdateLocationButton,
} from "@/components/design-system"

/* Dev-only catalog of every design-system component in every state. */

const COLOR_TOKENS = [
  ["bg", "App background"],
  ["surface-1", "Sheet, sidebar"],
  ["surface-2", "Cards, drawer"],
  ["surface-3", "Raised controls"],
  ["panel", "Dialogs, directory"],
  ["fg", "Text and icons"],
  ["brand", "Primary red"],
  ["brand-bright", "Red icons, hover"],
  ["brand-strong", "Pressed red"],
  ["brand-soft", "Red text"],
  ["brand-deep", "Dark red tints"],
  ["live", "Verified"],
  ["warn", "Warnings"],
  ["warn-strong", "Solid warning"],
  ["info", "Links, locate"],
  ["info-strong", "User location"],
  ["waze", "Waze"],
  ["google", "Google Maps"],
] as const

const TEXT_TOKENS = [
  ["text-fg", "Primary text"],
  ["text-fg-muted", "Secondary text (70%)"],
  ["text-fg-subtle", "Metadata (54%), the floor for readable text"],
] as const

const TYPE_SCALE = [
  ["text-eyebrow", "11 / 14", "Uppercase labels only"],
  ["text-caption", "12 / 16", "Metadata"],
  ["text-label", "13 / 18", "Controls, secondary lines"],
  ["text-body", "15 / 22", "Body"],
  ["text-title", "17 / 22", "Card titles"],
  ["text-heading", "22 / 28", "Section and dialog headings"],
  ["text-display", "30 / 34", "Page titles"],
] as const

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-20 scroll-mt-20">
      <h2 className="text-heading font-semibold tracking-tight text-fg mb-8 pb-3 border-b border-line">{title}</h2>
      <div className="space-y-12">{children}</div>
    </section>
  )
}

function Specimen({ name, note, children, bare }: { name: string; note?: string; children: ReactNode; bare?: boolean }) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-label font-semibold text-fg font-mono">{name}</p>
        {note && <p className="text-caption text-fg-subtle mt-1 max-w-2xl">{note}</p>}
      </div>
      {bare ? children : <div className="rounded-2xl border border-line bg-bg p-5">{children}</div>}
    </div>
  )
}

/** Contains position:fixed children (paint containment makes it their containing block). */
function Frame({ height, width, children, className }: { height: number; width?: number; children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line bg-surface-1 [contain:paint] max-w-full ${className ?? ""}`}
      style={{ height, width }}
    >
      {children}
    </div>
  )
}

/** Fake dark map so overlays have something to sit on. */
function MapBackdrop() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: "rgb(var(--gs-bg))",
        backgroundImage:
          "linear-gradient(rgb(var(--gs-fg) / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--gs-fg) / 0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  )
}

const noop = () => {}

export default function Kit() {
  const [first, second, third] = SAMPLE_SHELTERS

  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden bg-bg text-fg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-16">
          <p className="text-eyebrow font-semibold uppercase tracking-wider text-brand-soft">Get Shelter</p>
          <h1 className="text-display font-bold tracking-tight mt-2 sm:text-[40px] sm:leading-[44px]">Component kit</h1>
          <p className="text-body text-fg-muted mt-3 max-w-2xl">
            Every design-system component in every state, rendered from sample data. Phone layouts switch at the{" "}
            <code className="font-mono text-label">sm</code> (640px) and <code className="font-mono text-label">md</code>{" "}
            (768px) breakpoints, so narrow the window or open this page on a phone to see them. Tokens live in{" "}
            <code className="font-mono text-label">styles/tokens.css</code>.
          </p>
          <nav className="flex flex-wrap gap-2 mt-6">
            {["tokens", "shell", "shelter", "search", "map", "primitives"].map((id) => (
              <a key={id} href={`#${id}`} className="h-8 px-3.5 inline-flex items-center rounded-full border border-line-strong text-label text-fg-muted hover:text-fg capitalize">
                {id}
              </a>
            ))}
          </nav>
        </header>

        {/* ── TOKENS ───────────────────────────────────────── */}
        <Section id="tokens" title="Tokens">
          <Specimen name="Colors" note="Use with Tailwind opacity modifiers: bg-brand/15, border-fg/10. Hairlines use border-line and border-line-strong.">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {COLOR_TOKENS.map(([token, use]) => (
                <div key={token} className="rounded-xl border border-line overflow-hidden bg-surface-1">
                  <div className="h-14 border-b border-line" style={{ background: `rgb(var(--gs-${token}))` }} />
                  <div className="px-3 py-2.5">
                    <p className="text-label font-semibold font-mono">{token}</p>
                    <p className="text-caption text-fg-subtle">{use}</p>
                  </div>
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen name="Text colors" note="All three pass WCAG AA on every surface. Lower fg opacities are decoration only.">
            <div className="grid gap-4 sm:grid-cols-3">
              {TEXT_TOKENS.map(([cls, use]) => (
                <div key={cls}>
                  <p className={`text-title font-semibold ${cls}`}>מקלטים קרובים · Nearby</p>
                  <p className="text-caption font-mono text-fg-subtle mt-1">{cls} · {use}</p>
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen name="Type scale" note="Each size carries its own line height. Geist for Latin, Heebo for Hebrew, chosen per glyph.">
            <div className="space-y-4">
              {TYPE_SCALE.map(([cls, metric, use]) => (
                <div key={cls} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                  <span className="sm:w-48 shrink-0 text-caption font-mono text-fg-subtle">
                    {cls} <span className="opacity-70">{metric}</span>
                  </span>
                  <span className={`${cls} font-medium`}>מקלט ציבורי · Public shelter</span>
                  <span className="text-caption text-fg-subtle sm:ml-auto">{use}</span>
                </div>
              ))}
            </div>
          </Specimen>
        </Section>

        {/* ── SHELL ────────────────────────────────────────── */}
        <Section id="shell" title="Shell: top bar, menu, sidebar, bottom sheet">
          <Specimen
            name='<TopBar variant="app">'
            note="Shelter finder. Search is inline on desktop; on phones it collapses to an icon that expands over the bar."
            bare
          >
            <div className="space-y-3">
              <Frame height={57}>
                <TopBar search={() => <SearchField placeholder="חפש כתובת · Search an address" readOnly />} />
              </Frame>
              <Frame height={57} width={390}>
                <TopBar defaultSearchOpen search={() => <SearchField value="Dizengoff" onClear={noop} readOnly />} />
              </Frame>
            </div>
          </Specimen>

          <Specimen name='<TopBar variant="site">' note="Content pages. Inline links on desktop, Find shelter always visible." bare>
            <Frame height={57}>
              <TopBar variant="site" />
            </Frame>
          </Specimen>

          <Specimen name="<Brand>">
            <Brand />
          </Specimen>

          <Specimen name="<NavDrawerPanel>" note="Menu drawer. Emergency numbers are tap-to-call. Off the finder it leads with Find shelter." bare>
            <div className="flex flex-wrap gap-6">
              <Frame height={760} width={320}>
                <NavDrawerPanel pathname="/" className="h-full" />
              </Frame>
              <Frame height={760} width={320}>
                <NavDrawerPanel pathname="/about" className="h-full" />
              </Frame>
            </div>
          </Specimen>

          <Specimen name="<NearbySidebar>" note="Desktop (md and up): the column left of the map." bare>
            <Frame height={760} width={380}>
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
            name="<BottomSheet> + <NearbyHeader>"
            note="Phone (below md): drags between peek (42%), half (60%), and full (85%). The locate button rides on the sheet's top edge."
            bare
          >
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Peek, 390 × 844", h: 354, w: 390, vh: 844 },
                { label: "Peek, 375 × 667", h: 280, w: 375, vh: 667 },
              ].map(({ label, h, w, vh }) => (
                <div key={label}>
                  <p className="text-eyebrow font-semibold uppercase tracking-wider text-fg-subtle mb-2">{label}</p>
                  <Frame height={vh} width={w}>
                    <MapBackdrop />
                    <BottomSheet
                      label="Shelter list"
                      height={h}
                      accessory={<LocateButton />}
                      summary={<NearbyHeader shelters={SAMPLE_SHELTERS.slice(0, 3)} isLoading={false} onShare={noop} />}
                    >
                      <div className="px-3">
                        <ShelterList shelters={SAMPLE_SHELTERS.slice(0, 3)} isLoading={false} hasLocationError={false} onOpenShare={noop} />
                      </div>
                      <div className="px-3 pt-3 pb-4">
                        <BrowseAllButton onClick={noop} />
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
          <Specimen name="<ShelterCard>" note="Nearest (always expanded, one-tap Navigate), a collapsed row, and a row tapped open.">
            <div className="grid gap-3 lg:grid-cols-3 items-start">
              <ShelterCard shelter={first} rank={1} isClosest onShare={noop} />
              <ShelterCard shelter={second} rank={2} expanded={false} onToggle={noop} onShare={noop} />
              <ShelterCard shelter={third} rank={3} expanded onToggle={noop} onShare={noop} />
            </div>
          </Specimen>
          <Specimen name="<ShelterList> states" note="Loading skeleton, location needed, and no results.">
            <div className="grid gap-3 lg:grid-cols-3 items-start">
              <div className="rounded-2xl bg-surface-1 p-3"><ShelterListSkeleton /></div>
              <div className="rounded-2xl bg-surface-1"><ShelterList shelters={[]} isLoading={false} hasLocationError /></div>
              <div className="rounded-2xl bg-surface-1"><ShelterList shelters={[]} isLoading={false} hasLocationError={false} /></div>
            </div>
          </Specimen>
          <Specimen name="<RankBadge> · <DistanceReadout> · <ConfidenceBadge> · <CapacityTag>">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => <RankBadge key={r} rank={r} />)}
              </div>
              <div className="flex items-baseline gap-4">
                <DistanceReadout meters={64} size="lg" />
                <DistanceReadout meters={1420} />
              </div>
              <div className="flex flex-col gap-1.5">
                <ConfidenceBadge confidence="high" />
                <ConfidenceBadge confidence="medium" />
                <ConfidenceBadge confidence="low" />
              </div>
              <CapacityTag capacity={240} className="text-caption text-fg-muted" />
            </div>
          </Specimen>
          <Specimen name="<NavigationChooser> (ActionSheetPanel)" note="Hand-off to a maps app for driving. Bottom sheet on phones, centered card on desktop." bare>
            <div className="w-[390px] max-w-full">
              <ActionSheetPanel eyebrow={<Bi he="נווט עם" en="Drive with" />} title={first.address ?? ""} className="rounded-sheet border-b">
                <ActionSheetOption label="Waze" icon={Navigation} tone="waze" />
                <ActionSheetOption label="Google Maps" icon={MapIcon} tone="google" />
              </ActionSheetPanel>
            </div>
          </Specimen>
        </Section>

        {/* ── SEARCH ───────────────────────────────────────── */}
        <Section id="search" title="Search">
          <Specimen name="<SearchField>" note="Empty, typed, and searching.">
            <div className="grid gap-3 sm:grid-cols-3">
              <SearchField placeholder="חפש כתובת · Search an address" readOnly />
              <SearchField value="Dizengoff 50" onClear={noop} readOnly />
              <SearchField value="Dizengoff" loading readOnly />
            </div>
          </Specimen>
          <Specimen name="<AddressResults>" bare>
            <Frame height={260}>
              <div className="relative m-4 max-w-md">
                <SearchField value="Dizengoff" onClear={noop} readOnly />
                <AddressResults
                  onSelect={noop}
                  suggestions={[
                    { id: 1, label: "Dizengoff Street 50, Tel Aviv-Yafo" },
                    { id: 2, label: "Dizengoff Center, Tel Aviv-Yafo" },
                    { id: 3, label: "Dizengoff Square, Tel Aviv-Yafo" },
                  ]}
                />
              </div>
            </Frame>
          </Specimen>
        </Section>

        {/* ── MAP OVERLAYS ─────────────────────────────────── */}
        <Section id="map" title="Map overlays">
          <Specimen name="<MapTopStack>" note="Status pills stack at the top of the map, above the bottom sheet on phones." bare>
            <div className="grid gap-6 lg:grid-cols-2">
              <Frame height={240}>
                <MapBackdrop />
                <MapTopStack>
                  <LocatingPill />
                  <ActiveLocationPill label="Dizengoff 50, Tel Aviv" onReturnToMe={noop} onClear={noop} />
                </MapTopStack>
              </Frame>
              <Frame height={240}>
                <MapBackdrop />
                <MapTopStack>
                  <UpdateLocationButton />
                  <OutsideIsraelBanner />
                  <LocationErrorCard message="Location took too long. Tap to try again." />
                </MapTopStack>
              </Frame>
            </div>
          </Specimen>
          <Specimen name="<LocateButton>">
            <LocateButton />
          </Specimen>
          <Specimen name="<PermissionPrompt>" note="Covers the map when location permission is denied; search is right there." bare>
            <Frame height={640} width={390}>
              <MapBackdrop />
              <PermissionPrompt search={<SearchField placeholder="חפש כתובת · Search an address" readOnly />} />
            </Frame>
          </Specimen>
        </Section>

        {/* ── PRIMITIVES ───────────────────────────────────── */}
        <Section id="primitives" title="Primitives">
          <Specimen name="<Button>" note="One primary per surface. Sizes sm 36, md 44, lg 48, xl 52.">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="xl"><Navigation /><Bi he="נווט" en="Navigate" /></Button>
              <Button variant="secondary" size="lg"><Share2 />Share</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline" size="sm">Outline</Button>
              <Button variant="link" size="sm">Link</Button>
            </div>
          </Specimen>
          <Specimen name="<IconButton>" note="ghost on the chrome, surface for filled, glass over the map.">
            <div className="flex items-center gap-4">
              <IconButton label="Search"><Search /></IconButton>
              <IconButton label="Menu"><Menu /></IconButton>
              <IconButton label="Close" size="sm"><X /></IconButton>
              <IconButton label="Share" tone="surface" size="sm"><Share2 /></IconButton>
              <IconButton label="Donate" tone="glass" size="lg" className="text-brand-bright"><Heart /></IconButton>
            </div>
          </Specimen>
          <Specimen name="<Chip>">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="brand" size="xs"><Bi he="הקרוב ביותר" en="Nearest" /></Chip>
              <Chip tone="neutral">3</Chip>
              <Chip tone="outline">Public shelter</Chip>
              <Chip tone="live">Verified</Chip>
              <Chip tone="warn">Unverified</Chip>
              <Chip tone="neutral" size="md">Filter</Chip>
            </div>
          </Specimen>
          <Specimen name="<Bi>" note="Hebrew and English together, never a language switch: nobody should hunt for a toggle during a siren.">
            <div className="flex flex-wrap items-start gap-8 text-body">
              <Bi he="מקלטים קרובים" en="Nearby shelters" />
              <Bi he="נדרש מיקום" en="Location needed" layout="stack" />
            </div>
          </Specimen>
          <Specimen name="<EmergencyNumbers>">
            <EmergencyNumbers className="max-w-sm" />
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

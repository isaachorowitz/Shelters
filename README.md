<div align="center">

# 🛡️ Shelter Now

### Find the nearest bomb shelter in Israel — in one tap.

A free, open-source emergency PWA that locates the closest protected space to you and gives you walking, running, and cycling ETAs to safety. Built for the seconds that matter.

**[→ Open the live app at getshelter.app](https://getshelter.app)**

<sub>7,577 shelters · 56 cities · Free · No account · Works offline · MIT licensed</sub>

[![Live](https://img.shields.io/badge/live-getshelter.app-e11d48?style=for-the-badge)](https://getshelter.app)
[![License](https://img.shields.io/badge/license-MIT-000000?style=for-the-badge)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-22c55e?style=for-the-badge)](CONTRIBUTING.md)

</div>

---

## What it does

When a siren sounds, you have seconds. Shelter Now uses your location to instantly show the nearest public shelters, bomb shelters, reinforced spaces, and other protected places — ranked by real walking distance — on a live map, with turn-by-turn navigation one tap away.

- **📍 Instant proximity** — GPS-based, sorted by true Haversine distance, with walk / run / cycle / scooter ETAs.
- **🗺️ Every shelter on the map** — all 7,577 known shelters across 56 cities, not just the nearest few.
- **🔎 Search any address** — not where you'll be? Look up any location in Israel.
- **🌐 Bilingual** — full Hebrew + English UI, RTL-aware.
- **📡 Works offline** — installable PWA; the full shelter dataset is bundled, so it loads with no network and no backend.
- **🚩 Report a problem** — crowdsourced corrections keep the data honest.

## The data

Shelter locations are aggregated and de-duplicated from **12+ public sources** — municipal open-data portals (Tel Aviv, Jerusalem, Haifa, and more), Israel's national CKAN catalog, OpenStreetMap, and Google Places. The full pipeline is documented in **[DATA-PIPELINE.md](DATA-PIPELINE.md)**.

The merged dataset ships in [`data/shelters.json`](data/shelters.json), so shelter lookups need no database or API key. Map tiles require a free CARTO Basemaps key supplied by the app operator. Visitors need no key or signup.

## Run it locally

```bash
git clone https://github.com/isaachorowitz/Shelters.git
cd Shelters
pnpm install
pnpm dev
```

The dev command loads `NEXT_PUBLIC_CARTO_BASEMAP_API_KEY` from this project's Infisical connection, using the `dev` environment and `/shelters` path. Sign in to the Infisical CLI before running it, then open the printed `localhost` URL. Keep the key in Infisical; do not put it in a repository `.env` file.

> **Optional:** to serve shelters from a live Postgres/PostGIS database instead of the bundled JSON, add the Supabase variables listed in `env.example` to the same Infisical path. The app automatically falls back to the static dataset whenever the database is unset or unreachable.

### Build for production

```bash
pnpm build && pnpm start
```

The build loads the CARTO key from Infisical's `prod` environment at `/shelters` and stops if it is missing. Next.js embeds the public map key at build time, so rebuild after changing it. Cloudflare builds use `pnpm exec opennextjs-cloudflare build`, which runs the same configured build command.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Map | Leaflet + react-leaflet |
| Styling | Tailwind CSS + Radix UI |
| Data (optional) | Supabase / PostGIS, with bundled-JSON fallback |
| Hosting | Vercel |

## Contributing

This is a public-safety tool — **contributions genuinely help people.** The highest-impact thing you can do is improve the data: a missing shelter, a wrong location, or a new municipal source. Code, accessibility, and translation improvements are equally welcome.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** to get started, and check the [open issues](https://github.com/isaachorowitz/Shelters/issues).

## License

[MIT](LICENSE) — free to use, fork, and adapt. If you deploy a version for another region, we'd love to hear about it.

<div align="center">
<sub>Built by <a href="https://ziplyne.agency">ZipLyne</a> · Stay safe.</sub>
</div>

# Contributing to Shelter Now

Thank you for helping. This is a public-safety tool, so every fix — especially to the data — can genuinely matter to someone during an emergency.

## Ways to help (highest impact first)

### 1. Improve the shelter data
This is the most valuable contribution.

- **A shelter is missing, wrong, or mislocated?** Open an issue with the address or coordinates and what's wrong. If you can, use the in-app **Report a Problem** button — it pre-fills the details.
- **You know a public data source we don't use** (a municipal open-data portal, a GIS layer)? Open an issue describing it. New sources get added to the merge pipeline in [`DATA-PIPELINE.md`](DATA-PIPELINE.md).

The merged dataset lives in [`data/shelters.json`](data/shelters.json). Don't hand-edit it for bulk changes — it's generated. For one-off corrections, a precise issue is better than a manual JSON edit.

### 2. Accessibility & translation
The UI is bilingual (Hebrew / English) and used under stress. Improvements to screen-reader support, contrast, RTL handling, or wording are very welcome.

### 3. Code
Bug fixes, performance, and features. Please open an issue first for anything non-trivial so we can agree on the approach.

## Development setup

```bash
pnpm install
pnpm dev
```

The full 7,577-shelter dataset is bundled, so the app runs with **no database and no API keys**. See the [README](README.md#run-it-locally).

## Before you open a PR

```bash
pnpm lint     # must pass
pnpm build    # must pass (type-checked)
```

- Keep changes focused — one concern per PR.
- Match the existing code style; this is a TypeScript + Next.js App Router codebase.
- Describe what you changed and how you tested it. For data changes, cite your source.

## Reporting a security issue

Please **do not** open a public issue for security vulnerabilities. Email **go@ziplyne.agency** instead, and we'll respond promptly.

## Code of conduct

Be kind and constructive. We're all here to help people get to safety faster.

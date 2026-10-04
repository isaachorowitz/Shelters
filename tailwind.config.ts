import type { Config } from "tailwindcss";

/** Token-backed color: `rgb(var(--gs-x) / <alpha-value>)` so `bg-brand/15` works. */
const token = (name: string) => `rgb(var(--gs-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Design tokens (styles/tokens.css) ──
        bg: token("bg"),
        fg: {
          DEFAULT: token("fg"),
          /** Secondary text. AA on every surface. */
          muted: "rgb(var(--gs-fg) / 0.7)",
          /** Tertiary text and metadata. Still AA; never go lower for text. */
          subtle: "rgb(var(--gs-fg) / 0.54)",
        },
        line: {
          DEFAULT: "rgb(var(--gs-fg) / 0.08)",
          strong: "rgb(var(--gs-fg) / 0.14)",
        },
        scrim: token("scrim"),
        panel: token("panel"),
        surface: {
          1: token("surface-1"),
          2: token("surface-2"),
          3: token("surface-3"),
        },
        brand: {
          DEFAULT: token("brand"),
          bright: token("brand-bright"),
          strong: token("brand-strong"),
          soft: token("brand-soft"),
          deep: token("brand-deep"),
        },
        live: token("live"),
        warn: { DEFAULT: token("warn"), strong: token("warn-strong") },
        info: { DEFAULT: token("info"), strong: token("info-strong") },
        waze: token("waze"),
        google: token("google"),

        // ── shadcn/ui compatibility ──
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      // Extra opacity steps. Tailwind 3.4 only ships multiples of 5, so classes
      // like `border-white/8` used to compile to nothing and fell back to the
      // default gray-200 border. These make every `/N` step in the UI real.
      opacity: {
        3: "0.03",
        4: "0.04",
        6: "0.06",
        7: "0.07",
        8: "0.08",
        9: "0.09",
        12: "0.12",
        18: "0.18",
        22: "0.22",
        88: "0.88",
        92: "0.92",
        96: "0.96",
        97: "0.97",
        99: "0.99",
      },
      // Type scale. Each size carries its own line height; a `leading-*`
      // class still overrides it. Nothing below 11px, and 11px is for
      // uppercase eyebrow labels only.
      fontSize: {
        eyebrow: ["11px", "14px"],
        caption: ["12px", "16px"],
        label: ["13px", "18px"],
        body: ["15px", "22px"],
        title: ["17px", "22px"],
        heading: ["22px", "28px"],
        display: ["30px", "34px"],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        sheet: 'var(--gs-radius-sheet)',
      },
      spacing: {
        topbar: 'var(--gs-topbar-h)',
        sidebar: 'var(--gs-sidebar-w)',
        drawer: 'var(--gs-drawer-w)',
        touch: 'var(--gs-touch)',
      },
      maxWidth: {
        content: 'var(--gs-content-max)',
      },
      zIndex: {
        sidebar: "20",
        "map-overlay": "30",
        "map-modal": "40",
        sheet: "30",
        header: "40",
        modal: "50",
        directory: "60",
        "skip-link": "100",
        drawer: "9999",
        popover: "99999",
      },
      boxShadow: {
        sheet: "0 -12px 40px rgba(0,0,0,0.55)",
        drawer: "-12px 0 40px rgba(0,0,0,0.55)",
        popover: "0 16px 48px rgba(0,0,0,0.6)",
        "glow-brand": "0 8px 24px -6px rgba(220,38,38,0.55)",
      },
      transitionTimingFunction: {
        spring: "var(--gs-ease-spring)",
      },
      transitionDuration: {
        fast: "120ms",
        drawer: "260ms",
        sheet: "380ms",
      },
      fontFamily: {
        // Geist has no Hebrew glyphs; the browser falls back per glyph to Heebo.
        // Families are named directly (next/font registers them as "Geist" and
        // "Heebo") because the generated "Geist Fallback" face covers every code
        // point and, if it came first, Hebrew would never reach Heebo.
        sans: ["Geist", "Heebo", "Geist Fallback", "Heebo Fallback", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

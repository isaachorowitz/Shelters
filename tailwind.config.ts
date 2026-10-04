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
        fg: token("fg"),
        scrim: token("scrim"),
        panel: token("panel"),
        surface: {
          1: token("surface-1"),
          2: token("surface-2"),
          3: token("surface-3"),
          4: token("surface-4"),
        },
        brand: {
          DEFAULT: token("brand"),
          bright: token("brand-bright"),
          strong: token("brand-strong"),
          soft: token("brand-soft"),
          softer: token("brand-softer"),
          deep: token("brand-deep"),
        },
        live: { DEFAULT: token("live"), strong: token("live-strong") },
        warn: {
          DEFAULT: token("warn"),
          soft: token("warn-soft"),
          pale: token("warn-pale"),
          muted: token("warn-muted"),
          strong: token("warn-strong"),
          press: token("warn-press"),
          deep: token("warn-deep"),
          pin: token("warn-pin"),
          "pin-soft": token("warn-pin-soft"),
          "pin-edge": token("warn-pin-edge"),
        },
        info: {
          DEFAULT: token("info"),
          soft: token("info-soft"),
          strong: token("info-strong"),
        },
        caution: token("caution"),
        "danger-deep": token("danger-deep"),
        walk: token("walk"),
        run: token("run"),
        drive: token("drive"),
        rank: {
          1: token("rank-1"),
          2: token("rank-2"),
          3: token("rank-3"),
          4: token("rank-4"),
          5: token("rank-5"),
        },
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
      // Font sizes without a paired line-height, so they sit inside the
      // surrounding leading exactly like the px values they replaced.
      fontSize: {
        nano: "8px",
        micro: "9px",
        tiny: "10px",
        caption: "11px",
        label: "12px",
        ui: "13px",
        body: "14px",
        title: "15px",
        heading: "16px",
        display: "22px",
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
        sheet: "0 -8px 40px rgba(0,0,0,0.7)",
        "action-sheet": "0 -12px 60px rgba(0,0,0,0.8)",
        drawer: "-8px 0 40px rgba(0,0,0,0.6)",
        popover: "0 12px 48px rgba(0,0,0,0.95)",
        pin: "0 4px 20px rgba(0,0,0,0.6)",
        "glow-brand": "0 0 20px rgba(220,38,38,0.15)",
      },
      transitionTimingFunction: {
        spring: "var(--gs-ease-spring)",
      },
      transitionDuration: {
        fast: "120ms",
        drawer: "220ms",
        sheet: "380ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

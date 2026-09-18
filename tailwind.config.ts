import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- DESIGN.MD Palette (Supabase-identical) ---
        // Backgrounds
        base: "#0A0A0A",
        card: "#171717",

        // Accent: Mint Green — Supabase brand color
        accent: {
          DEFAULT: "#3ECF8E",
          hover: "#34B87C",
        },

        // Text
        primary: "#FFFFFF",
        secondary: "#8B949E",

        // Status (unchanged — not in spec)
        "status-success": "#34D399",
        "status-warning": "#FBBF24",
        "status-danger": "#F87171",
        "status-info": "#60A5FA",

        // Legacy aliases — keep so other pages don't break
        "app-bg": "#0A0A0A",
        "surface-1": "#171717",
        "surface-2": "#1C1C1C",
        "surface-3": "#252525",
        "panel-bg": "#171717",
        "card-bg": "#171717",
        "accent-primary": "#3ECF8E",
        "accent-hover": "#34B87C",
        "accent-soft": "#3ECF8E",
        "accent-muted": "rgba(62, 207, 142, 0.10)",
        "accent-blue": "#3ECF8E",
        "accent-blue-soft": "#3ECF8E",
        "text-primary": "#FFFFFF",
        "text-secondary": "#8B949E",
        "text-muted": "#8B949E",
        "border-subtle": "rgba(255,255,255,0.05)",
        "border-default": "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(62,207,142,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,0.03) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "accent-gradient": "linear-gradient(135deg, #3ECF8E 0%, #34B87C 100%)",
        "accent-gradient-soft": "linear-gradient(135deg, rgba(62,207,142,0.15) 0%, rgba(52,184,124,0.15) 100%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
      },
      backgroundSize: {
        "grid-pattern": "40px 40px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(62,207,142,0.1)",
        "card-glow": "0 0 20px rgba(62,207,142,0.12)",
        "panel": "0 4px 16px rgba(0,0,0,0.4)",
        "dropdown": "0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink": "blink 1.2s step-end infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

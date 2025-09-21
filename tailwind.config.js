/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Custom dark theme colors
        bg: {
          900: "#070910",
          800: "#0e1724",
        },
        surface: {
          800: "#0e1724",
          700: "#1a2332",
          600: "#253041",
        },
        primary: {
          500: "#7C5CFF",
          400: "#9B7FFF",
          600: "#5D3FCC",
          DEFAULT: "#7C5CFF",
          foreground: "#ffffff",
        },
        accent: {
          400: "#00E5FF",
          300: "#33EBFF",
          500: "#00BCD4",
          DEFAULT: "#00E5FF",
          foreground: "#070910",
        },
        success: {
          400: "#22c55e",
          300: "#4ade80",
          500: "#16a34a",
          DEFAULT: "#22c55e",
        },
        danger: {
          400: "#ff6b6b",
          300: "#ff8a8a",
          500: "#e53e3e",
          DEFAULT: "#ff6b6b",
        },
        muted: {
          300: "#94a3b8",
          400: "#64748b",
          500: "#475569",
          DEFAULT: "#94a3b8",
          foreground: "#cbd5e1",
        },
        // shadcn/ui compatible colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        azonix: ["Azonix", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "Roboto", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 92, 255, 0.3)",
        "glow-accent": "0 0 20px rgba(0, 229, 255, 0.3)",
        neon: "0 0 5px rgba(124, 92, 255, 0.5), 0 0 20px rgba(124, 92, 255, 0.3), 0 0 35px rgba(124, 92, 255, 0.1)",
        "neon-accent":
          "0 0 5px rgba(0, 229, 255, 0.5), 0 0 20px rgba(0, 229, 255, 0.3), 0 0 35px rgba(0, 229, 255, 0.1)",
        "3d": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 10px 15px -3px rgba(124, 92, 255, 0.1)",
        "3d-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(124, 92, 255, 0.1)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(124, 92, 255, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(124, 92, 255, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        tilt: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(1deg)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        tilt: "tilt 0.3s ease-out forwards",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        glass:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

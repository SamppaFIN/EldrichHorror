import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Standard screen sizes
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        
        // High-resolution screens for landscape mode
        'full-hd': '1920px',
        '2k': '2560px',
        '4k': '3840px',
        
        // Orientation-based utilities
        'landscape': {'raw': '(orientation: landscape)'},
        'portrait': {'raw': '(orientation: portrait)'},
        
        // Samsung DeX and external display support
        'dex': {'raw': '(min-width: 1024px) and (min-height: 768px)'},
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      // UI spacing for landscape layouts
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      // Font sizes optimized for different screens
      fontSize: {
        // ... (existing font sizes)
        'hd': ['1rem', { lineHeight: '1.5rem' }], // 1080p screens
        'fullhd': ['1.125rem', { lineHeight: '1.75rem' }], // 1080p screens
        '2k': ['1.25rem', { lineHeight: '2rem' }], // 1440p screens
        '4k': ['1.5rem', { lineHeight: '2.25rem' }], // 4K screens
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "pulse-medium": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.75" },
        },
        "pulse-fast": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "pulse-very-fast": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slow-tilt": {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(0.5deg)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(-0.5deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "fade-in-out": {
          "0%": { opacity: "0" },
          "50%": { opacity: "0.7" },
          "100%": { opacity: "0" },
        },
        "distortion": {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(2px)" },
          "50%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(1px)" },
          "100%": { transform: "translateX(0)" },
        },
        "warp-top": {
          "0%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(1.03)" },
          "100%": { transform: "scaleX(1)" },
        },
        "warp-bottom": {
          "0%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(0.97)" },
          "100%": { transform: "scaleX(1)" },
        },
        "warp-left": {
          "0%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.02)" },
          "100%": { transform: "scaleY(1)" },
        },
        "warp-right": {
          "0%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(0.98)" },
          "100%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "pulse-medium": "pulse-medium 3s ease-in-out infinite",
        "pulse-fast": "pulse-fast 2s ease-in-out infinite",
        "pulse-very-fast": "pulse-very-fast 1.5s ease-in-out infinite",
        "slow-tilt": "slow-tilt 8s ease-in-out infinite",
        "fade-in-out": "fade-in-out 8s ease-in-out infinite",
        "distortion": "distortion 0.2s ease-in-out infinite",
        "warp-top": "warp-top 3s ease-in-out infinite",
        "warp-bottom": "warp-bottom 2.8s ease-in-out infinite",
        "warp-left": "warp-left 3.5s ease-in-out infinite",
        "warp-right": "warp-right 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

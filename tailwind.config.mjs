/** @type {import('tailwindcss').Config} */

const BASE = 16;
const getValues = (px) => ({ tw: px / 4, rem: `${px / BASE}rem` });
const pxToRem = (px) => getValues(px).rem;
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      spacing: {},
      gap: {},
      colors: {
        "tonal-white-30": "rgba(255, 255, 255, 0.3)",
        "tonal-white-50": "rgba(255, 255, 255, 0.5)",
        "tonal-black-30": "rgba(25, 25, 25, 0.3)",
        black: "#191919",
      },
      backgroundColor: {
        dark: "#121212",
        black: "#191919",
        "light-gray": "#E1E1E1",
      },
      fontSize: {
        "seo-1": [
          pxToRem(42),
          {
            lineHeight: "0.87",
            letterSpacing: "-0.04em",
            fontWeight: "500",
          },
        ],
        "seo-2": [
          pxToRem(32),
          "2rem",
          {
            lineHeight: "0.875",
            letterSpacing: "-1.28px",
            fontWeight: "500",
          },
        ],
        "seo-3": [
          pxToRem(26),
          {
            // 26px
            lineHeight: "0.92308",
            letterSpacing: "-0.52px",
            fontWeight: "500",
          },
        ],
        "seo-1-dp": [
          pxToRem(76),
          {
            // 76px
            lineHeight: "0.84211",
            letterSpacing: "-3.04px",
            fontWeight: "500",
          },
        ],
        "seo-2-dp": [
          pxToRem(56),
          {
            // 56px
            lineHeight: "0.85714",
            letterSpacing: "-2.24px",
            fontWeight: "500",
          },
        ],
        "seo-3-dp": [
          pxToRem(40),
          {
            // 40px
            lineHeight: "0.9",
            letterSpacing: "-1.6px",
            fontWeight: "500",
          },
        ],
        40: [
          pxToRem(40),
          {
            // 40px
            lineHeight: "0.9",
            letterSpacing: "-1.6px",
            fontWeight: "400",
          },
        ],
        28: [
          pxToRem(28),
          {
            // 28px
            lineHeight: "1.875rem",
            fontWeight: "400",
          },
        ],
        26: [
          pxToRem(26),
          {
            // 26px
            lineHeight: "0.92308",
            letterSpacing: "-0.52px",
            fontWeight: "400",
          },
        ],
        24: [
          pxToRem(24),
          {
            // 24px
            lineHeight: "1.08333",
            letterSpacing: "-0.48px",
            fontWeight: "400",
          },
        ],
        20: [
          pxToRem(20),
          {
            // 20px
            lineHeight: "1.2",
            letterSpacing: "-0.4px",
            fontWeight: "400",
          },
        ],
        "20-alt": [
          pxToRem(20),
          {
            // 20px alternative
            lineHeight: "1.3",
            letterSpacing: "-0.4px",
            fontWeight: "400",
          },
        ],
        16: [
          pxToRem(16),
          {
            // 16px
            lineHeight: "1.125",
            fontWeight: "400",
          },
        ],
        14: [
          pxToRem(14),
          {
            // 14px
            lineHeight: "1.28571",
            fontWeight: "400",
          },
        ],
      },
    },
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }
      md: "768px",
      // => @media (min-width: 768px) { ... }
      lg: "1024px",
      // => @media (min-width: 1024px) { ... }
      xl: "1280px",
      // => @media (min-width: 1280px) { ... }
      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
    },
  },
  plugins: [],
  corePlugins: {
    container: false,
    preflight: false,
  },
};

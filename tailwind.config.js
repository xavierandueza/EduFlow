/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      width: {
        112: "28rem", // 448px
        128: "32rem", // 512px
        144: "36rem", // 576px
        160: "40rem", // 640px
        176: "44rem", // 704px
        192: "48rem", // 768px
        208: "52rem", // 832px
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
      },
      colors: {
        "dark-blue": "#395d74",
        "dark-teal": "#388a91",
        "light-teal": "#0aa29d",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

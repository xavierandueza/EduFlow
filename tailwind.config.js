/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
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
      screens: {
        origin: "800px",
      },
      colors: {
        "dark-blue": "#395d74",
        "dark-teal": "#388a91",
        "light-teal": "#0aa29d",
      },
    },
  },
  plugins: [],
};

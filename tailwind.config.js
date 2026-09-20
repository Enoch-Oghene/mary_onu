/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // Mobile-only presentation. The site is intentionally rendered as
    // the mobile layout regardless of viewport — on desktop the mobile
    // view is centered in a cream-surround letterbox (see App.jsx).
    // Pushing md: / lg: past any realistic viewport width neutralises
    // every `md:*` / `lg:*` utility across the codebase without
    // touching each usage individually. sm: is kept at its default in
    // case it ever gets used; currently the codebase uses none.
    screens: {
      sm: "640px",
      md: "9999px",
      lg: "9999px",
      xl: "9999px",
      "2xl": "9999px",
    },
    extend: {
      colors: {
        cream: "#EFEBDE",
        acid: "#CCFF33",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

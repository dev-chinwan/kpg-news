/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171412",
        paper: "#FBFAF7",
        "paper-dim": "#F2F0EA",
        rule: "#DEDAD0",
        sindoor: "#A9222E",
        "sindoor-dark": "#7C1620",
        slate: "#5B564E",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        "display-hi": ["var(--font-display-hi)", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        "body-hi": ["var(--font-body-hi)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        content: "1240px",
      },
    },
  },
  plugins: [],
};

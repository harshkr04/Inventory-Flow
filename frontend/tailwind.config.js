/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(220 20% 98%)",
        surface: "hsl(0 0% 100%)",
        border: "hsl(220 15% 91%)",
        muted: "hsl(220 15% 96%)",
        "muted-fg": "hsl(220 10% 45%)",
        fg: "hsl(220 25% 12%)",
        primary: "hsl(221 83% 53%)",
        "primary-fg": "hsl(0 0% 100%)",
        success: "hsl(142 71% 45%)",
        warning: "hsl(38 92% 50%)",
        danger: "hsl(0 84% 60%)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bfd3fe",
          300: "#93b4fd",
          400: "#608bfa",
          500: "#3b63f5",
          600: "#2545e8",
          700: "#1e35d1",
          800: "#1f2ea9",
          900: "#1f2c85",
          950: "#171d54",
        },
      },
    },
  },
  plugins: [],
};
export default config;

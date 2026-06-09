import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        felt: {
          900: "#063f35",
          800: "#075247",
          700: "#0a6659"
        },
        chip: {
          red: "#d22f42",
          blue: "#2757c8",
          black: "#1f2937"
        }
      }
    }
  },
  plugins: []
};

export default config;

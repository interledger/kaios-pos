/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        kai: "270px",
      },
      colors: {
        transparent: 'transparent',
        kaiBg: "#00ba91",
        kaiAccent: "#82c51b",
        kaiText: "#fff",
        kaiMuted: "#b0b0b0",
      },
      fontSize: {
        xs: ["10px", "14px"],
        sm: ["12px", "16px"],
        base: ["14px", "18px"],
        lg: ["16px", "20px"],
        xl: ["18px", "22px"],
      },
      borderRadius: {
        kai: "8px",
      },
      spacing: {
        kai: "2px",
      },
    },
  },
  plugins: [],
};

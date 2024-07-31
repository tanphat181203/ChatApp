/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-blue-rgba": "rgba(17, 25, 40, 0.75)",
        "dark-blue-rgba-1": "rgba(17, 25, 40, 0.50)",
        "dark-blue-rgba-2": "rgba(17, 25, 40, 0.30)",
      },
      flex: {
        2: "2 2 0%",
      },
      maxWidth: {
        "7/10": "70%",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};

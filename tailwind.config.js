/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        mist: "#f7fbff",
        teal: "#0f766e",
        coral: "#f9735b",
        amber: "#f59e0b"
      },
      boxShadow: {
        glass: "0 24px 80px rgba(16, 24, 40, 0.18)"
      }
    }
  },
  plugins: []
};

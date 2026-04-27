export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        simba: {
          red: "#E63946",
          navy: "#1D3557",
          orange: "#F4A261",
          light: "#F8F9FA",
        }
      },
      fontFamily: {
        heading: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "bounce-once": "bounceOnce 0.4s ease-out",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        slideIn: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        fadeUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        bounceOnce: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.3)" } },
      }
    }
  },
  plugins: [],
}

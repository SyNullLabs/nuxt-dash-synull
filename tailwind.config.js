/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app.vue",
    "./components/**/*.{vue,js,ts}",
    "./composables/**/*.{js,ts}",
    "./layouts/**/*.{vue,js,ts}",
    "./pages/**/*.{vue,js,ts}",
    "./plugins/**/*.{js,ts}",
    "./server/**/*.{js,ts}",
    "./stores/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "synull-100": "rgba(177, 116, 209, 0.1)",
        "synull-200": "rgba(177, 116, 209, 0.2)",
        "synull-300": "rgba(177, 116, 209, 0.3)",
        "synull-400": "rgba(177, 116, 209, 0.4)",
        "synull-500": "rgba(177, 116, 209, 0.5)",
        "synull-600": "rgba(177, 116, 209, 0.6)",
        "synull-700": "rgba(177, 116, 209, 0.7)",
        "synull-800": "rgba(177, 116, 209, 0.8)",
        "synull-900": "rgba(177, 116, 209, 0.9)",
        synull: "#b074d1",
        "synull-light": "#d7b9e8",
        "synull-light-2": "#f3e5f5",
        "synull-light-3": "#fbf5ff",
        // 其他颜色配置
      },
    },
  },
  plugins: [],
};

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
        "synull-100": "var(--ui-color-primary-100)",
        "synull-200": "var(--ui-color-primary-200)",
        "synull-300": "var(--ui-color-primary-300)",
        "synull-400": "var(--ui-color-primary-400)",
        "synull-500": "var(--ui-color-primary-500)",
        "synull-600": "var(--ui-color-primary-600)",
        "synull-700": "var(--ui-color-primary-700)",
        "synull-800": "var(--ui-color-primary-800)",
        "synull-900": "var(--ui-color-primary-900)",
        synull: "var(--ui-color-primary-600)",
        "synull-light": "var(--ui-color-primary-100)",
        "synull-light-2": "var(--ui-color-primary-50)",
        "synull-light-3": "var(--ui-color-primary-50)",
        // 其他颜色配置
      },
    },
  },
  plugins: [],
};

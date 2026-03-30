/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.{vue,js}',
    './pages/**/*.{vue,js}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'yunyoo-100': 'rgba(177, 116, 209, 0.1)',
        'yunyoo-200': 'rgba(177, 116, 209, 0.2)',
        'yunyoo-300': 'rgba(177, 116, 209, 0.3)',
        'yunyoo-400': 'rgba(177, 116, 209, 0.4)',
        'yunyoo-500': 'rgba(177, 116, 209, 0.5)',
        'yunyoo-600': 'rgba(177, 116, 209, 0.6)',
        'yunyoo-700': 'rgba(177, 116, 209, 0.7)',
        'yunyoo-800': 'rgba(177, 116, 209, 0.8)',
        'yunyoo-900': 'rgba(177, 116, 209, 0.9)',
        'yunyoo': '#b074d1',
        'yunyoo-light': '#d7b9e8',
        'yunyoo-light-2': '#f3e5f5',
        'yunyoo-light-3': '#fbf5ff',
        // 其他颜色配置
      },
    },
  },
  plugins: [],
}

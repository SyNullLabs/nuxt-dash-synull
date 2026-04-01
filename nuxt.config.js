import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  // 全局页面头部
  app: {
    head: {
      title: "用户后台",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "用户后台管理系统",
        },
        { name: "format-detection", content: "telephone=no" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      script: [
        {
          src: "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback",
          async: true,
          defer: true,
        },
      ],
    },
  },

  // 全局 CSS
  css: ["@/assets/css/tailwind.css"],

  // 插件在渲染页面之前运行
  plugins: [
    // 将 chart.js 改为 chart.client.ts
    "@/plugins/chart.client.ts",
  ],

  // 自动导入组件
  components: true,

  // 开发和构建的模块
  modules: [
    "@nuxt/ui",
    "@nuxt/icon",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@formkit/auto-animate",
    "@vite-pwa/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Roboto: true,
          "Josefin+Sans": true,
          Lato: [100, 300],
          Raleway: {
            wght: [100, 400],
            ital: [100],
          },
          Inter: "200..700",
          "Crimson Pro": {
            wght: "200..900",
            ital: "200..700",
          },
          // 添加中文字体
          "Noto+Sans+SC": true,
          "Noto+Serif+SC": true,
          "ZCOOL+KuaiLe": true,
        },
      },
    ],
    "@nuxthub/core",
    "nuxt-auth-utils",
    "@nuxtjs/turnstile",
    "@nuxt/scripts",
    "@nuxtjs/color-mode",
  ],

  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
    disableTransition: true,
    storageKey: "synull-color-mode-v2",
  },

  // Vite 配置
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
  },

  router: {
    middleware: ["auth"],
  },

  i18n: {
    vueI18n: "./i18n.config.ts",
    locales: [
      { code: "zh-CN", language: "zh-CN", file: "zh-CN.json" },
      { code: "en-US", language: "en-US", file: "en-US.json" },
      { code: "zh-TW", language: "zh-TW", file: "zh-TW.json" },
    ],
    langDir: "locales",
    defaultLocale: "zh-CN",
    detectBrowserLanguage: false,
    strategy: "no_prefix",
  },

  compatibilityDate: "2024-09-21",

  // 添加新的路由配置
  pages: true,

  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY,
    secretKey: process.env.TURNSTILE_SECRET_KEY,
  },

  runtimeConfig: {
    backUrl:
      process.env.MIDDLEWARE_BACKEND_URL ||
      process.env.BACK_URL ||
      process.env.BACKEND_URL ||
      process.env.NUXT_BACK_URL,
    turnstile: {
      secretKey: process.env.TURNSTILE_SECRET_KEY,
    },
    public: {
      baseURL:
        process.env.NUXT_PUBLIC_BASE_URL ||
        process.env.BASE_URL ||
        "http://localhost:3000",
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    },
  },

  devtools: {
    enabled: true,
  },

  dev: process.env.NODE_ENV !== "production",
  debug: process.env.NODE_ENV !== "production",
});

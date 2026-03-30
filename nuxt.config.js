import { defineNuxtConfig } from "nuxt/config";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

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
    "@/plugins/chart.client.ts"
  ],

  // 自动导入组件
  components: true,

  // 开发和构建的模块
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/icon",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@formkit/auto-animate",
    "@nuxtjs/eslint-module",
    "@vite-pwa/nuxt",
    "nuxt-twemoji",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Roboto: true,
          Inter: [400, 700],
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
    "nuxtjs-naive-ui",
  ],

  // 构建配置
  build: {
    transpile: ["twemoji"],
  },

  // Vite 配置
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
    plugins: [
      // 添加自动导入插件
      AutoImport({
        imports: [
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar',
            ],
          },
        ],
        dts: false, // 禁用 TypeScript 声明文件生成
        eslintrc: {
          enabled: true, // 启用 ESLint 集成
        },
      }),
      // 添加组件自动加载插件
      Components({
        resolvers: [NaiveUiResolver()],
      })
    ],
  },

  router: {
    middleware: ["auth"],
  },

  // ESLint 配置
  eslint: {
    lintOnStart: false,
    emitError: false,
    emitWarning: false,
  },

  i18n: {
    vueI18n: "./nuxt-i18n.js",
    locales: ["zh-CN", "en-US", "zh-TW"],
    defaultLocale: "zh-CN",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
    },
    strategy: "no_prefix",
  },

  twemoji: {
    expiresIn: 3.154e7,
  },

  compatibilityDate: "2024-09-21",

  // 添加新的路由配置
  pages: true,

  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY,
    secretKey: process.env.TURNSTILE_SECRET_KEY,
  },

  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || "http://localhost:3000",
    },
    turnstile: {
      secretKey: process.env.TURNSTILE_SECRET_KEY,
    },
    public: {
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    },
  },

  devtools: {
    enabled: true,
  },

  dev: process.env.NODE_ENV !== "production",
  debug: process.env.NODE_ENV !== "production",

  // 添加 typescript 配置
  typescript: {
    shim: false
  },
});

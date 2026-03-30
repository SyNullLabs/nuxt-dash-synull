import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

const nuxtGlobals = {
  $fetch: "readonly",
  ClientOnly: "readonly",
  NuxtLayout: "readonly",
  NuxtLink: "readonly",
  NuxtPage: "readonly",
  clearAuthToken: "readonly",
  createError: "readonly",
  defineEventHandler: "readonly",
  defineNuxtConfig: "readonly",
  defineNuxtPlugin: "readonly",
  defineNuxtRouteMiddleware: "readonly",
  definePageMeta: "readonly",
  defineStore: "readonly",
  getAuthToken: "readonly",
  getHeader: "readonly",
  getQuery: "readonly",
  navigateTo: "readonly",
  readBody: "readonly",
  refreshNuxtData: "readonly",
  setAuthToken: "readonly",
  useApiClient: "readonly",
  useFetch: "readonly",
  useRuntimeConfig: "readonly",
  verifyTurnstileToken: "readonly",
};

export default [
  {
    ignores: [
      ".nuxt/**",
      ".output/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        ...nuxtGlobals,
        defineI18nConfig: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
];

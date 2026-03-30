import { useCookie } from "#app";
import { defineNuxtPlugin } from "nuxt/app";
import { normalizeLocaleCode } from "~/composables/useLocalePreference";

export default defineNuxtPlugin((nuxtApp) => {
  const localeCookie = useCookie("i18n_redirected");

  nuxtApp.$i18n.locale.value = normalizeLocaleCode(
    localeCookie.value || nuxtApp.$i18n.locale.value
  );
});

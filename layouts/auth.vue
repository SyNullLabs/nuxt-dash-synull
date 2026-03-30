<template>
  <div
    class="auth-layout relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#101116_0%,#0a0b0e_100%)] text-white"
  >
    <AlertMessage />
    <header
      class="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-8"
    >
      <NuxtLink
        to="/"
        class="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-white/34 transition-colors hover:text-white/72"
      >
        Synull
      </NuxtLink>
      <UDropdownMenu
        :items="languageItems"
        :content="{ align: 'end', side: 'bottom' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          class="rounded-full bg-white/6 px-3.5 py-2 text-xs font-medium text-white/58 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
        >
          {{ currentLanguageLabel }}
        </UButton>
      </UDropdownMenu>
    </header>

    <div
      class="relative flex min-h-screen items-center justify-center px-6 py-24"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import AlertMessage from "~/components/AlertMessage.vue";
import {
  normalizeLocaleCode,
  persistLocaleCode,
} from "~/composables/useLocalePreference";
import { useAffStore } from "~/stores/aff";

useAffStore();

const { locale } = useI18n();

const availableLanguages = [
  { code: "zh-CN", name: "简体中文", shortName: "简中" },
  { code: "zh-TW", name: "繁體中文", shortName: "繁中" },
  { code: "en-US", name: "English", shortName: "EN" },
];

const changeLanguage = (langCode) => {
  locale.value = persistLocaleCode(langCode);
};

const currentLanguageCode = computed(() => normalizeLocaleCode(locale.value));
const currentLanguageLabel = computed(
  () =>
    availableLanguages.find((lang) => lang.code === currentLanguageCode.value)
      ?.shortName || "简中"
);

const languageItems = computed(() => [
  availableLanguages.map((lang) => ({
    label: `${currentLanguageCode.value === lang.code ? "✓ " : ""}${lang.name}`,
    onSelect: () => changeLanguage(lang.code),
  })),
]);

onMounted(() => {
  locale.value = normalizeLocaleCode(locale.value);
});
</script>

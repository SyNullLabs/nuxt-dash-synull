<template>
  <div
    class="auth-layout dashboard-shell relative min-h-screen overflow-hidden text-[color:var(--ui-text)]"
  >
    <header
      class="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-8"
    >
      <NuxtLink
        to="/"
        class="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--ui-text-dim)] transition-colors hover:text-[color:var(--ui-text-muted)]"
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
          class="rounded-full bg-[var(--ui-bg-soft)] px-3.5 py-2 text-xs font-medium text-[color:var(--ui-text-muted)] ring-1 ring-[color:var(--ui-border)] transition-colors hover:bg-[var(--synull-shell-hover)] hover:text-[color:var(--ui-text)]"
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

<template>
  <div
    class="auth-layout dashboard-shell relative min-h-screen overflow-hidden text-[color:var(--ui-text)]"
  >
    <div
      class="relative flex min-h-screen flex-col items-center justify-center px-6 py-24"
    >
      <div class="w-full max-w-[28rem]">
        <div class="auth-panel rounded-[1.75rem] p-8 sm:p-9">
          <slot />
        </div>

        <div class="mt-5 flex items-center justify-center gap-2">
          <UColorModeButton />

          <UDropdownMenu
            :items="languageItems"
            :content="{ align: 'center', side: 'top' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="tabler:language"
              aria-label="Switch language"
              square
            />
          </UDropdownMenu>
        </div>
      </div>

      <NuxtLink
        to="/"
        class="absolute bottom-6 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--ui-text-dim)] transition-colors hover:text-[color:var(--ui-text-muted)]"
      >
        SyNull
      </NuxtLink>
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
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", name: "繁體中文", flag: "🇨🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
];

const changeLanguage = (langCode) => {
  locale.value = persistLocaleCode(langCode);
};

const languageItems = computed(() => [
  availableLanguages.map((lang) => ({
    label: `${normalizeLocaleCode(locale.value) === lang.code ? "✓ " : ""}${lang.flag} ${lang.name}`,
    onSelect: () => changeLanguage(lang.code),
  })),
]);

onMounted(() => {
  locale.value = normalizeLocaleCode(locale.value);
});
</script>

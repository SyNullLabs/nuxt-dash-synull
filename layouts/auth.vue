<template>
  <div
    class="auth-layout min-h-screen bg-gray-100 flex flex-col items-center justify-center bg-synull-100 relative p-3"
  >
    <AlertMessage />
    <slot />

    <UDropdownMenu
      :items="languageItems"
      :content="{ align: 'end', side: 'top' }"
      class="absolute right-3 top-3"
    >
      <UButton
        color="neutral"
        variant="ghost"
        square
        class="h-10 w-10 rounded-full transition duration-300 ease-in-out"
      >
        <Icon
          name="tabler:language"
          class="text-xl"
          :class="
            loading
              ? 'mt-2 text-gray-300'
              : 'text-gray-400 hover:text-gray-500 active:text-synull transition duration-300 ease-in-out'
          "
        />
      </UButton>
    </UDropdownMenu>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import AlertMessage from "~/components/AlertMessage.vue";
import { useAffStore } from "~/stores/aff";

const loading = ref(true);

useAffStore();

const { locale } = useI18n();

const availableLanguages = [
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", name: "繁體中文", flag: "🇨🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
];

const changeLanguage = (langCode) => {
  locale.value = langCode;
  document.cookie = `i18n_redirected=${langCode}; max-age=31536000; path=/`;
};

const languageItems = computed(() => [
  availableLanguages.map((lang) => ({
    label: `${locale.value === lang.code ? "✓ " : ""}${lang.flag} ${lang.name}`,
    onSelect: () => changeLanguage(lang.code),
  })),
]);

onMounted(() => {
  loading.value = false;
});
</script>

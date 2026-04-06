<template>
  <div
    class="flex h-(--ui-header-height) shrink-0 items-center justify-between gap-3 border-b border-default bg-[--ui-bg]/80 px-4 backdrop-blur sm:px-6"
  >
    <div class="min-w-0 flex items-center gap-3">
      <UButton
        class="lg:hidden"
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        aria-label="Toggle sidebar"
        @click="sidebarOpen = !sidebarOpen"
      />

      <UButton
        class="hidden lg:inline-flex"
        icon="i-lucide-panel-left"
        color="neutral"
        variant="ghost"
        aria-label="Toggle sidebar"
        @click="sidebarOpen = !sidebarOpen"
      />

      <span class="truncate text-sm font-semibold text-highlighted">
        {{ navbarTitle }}
      </span>
    </div>

    <div class="flex items-center gap-1.5 sm:gap-2">
      <UColorModeButton />

      <UDropdownMenu
        :items="languageItems"
        :content="{ align: 'end', side: 'bottom' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="tabler:language"
          aria-label="Switch language"
          square
        />
      </UDropdownMenu>

      <span v-if="isLoggedIn" class="hidden text-sm text-muted xl:inline">
        {{ $t("welcome") }} {{ userInfo?.user?.username || "" }}
      </span>

      <UDropdownMenu
        v-if="isLoggedIn"
        :items="profileMenuItems"
        :content="{ align: 'end', side: 'bottom' }"
      >
        <UAvatar
          :src="avatarSrc"
          alt="用户头像"
          size="sm"
          class="cursor-pointer"
        />
      </UDropdownMenu>

        <UButton
          v-else
          to="/auth/login"
          color="neutral"
          variant="soft"
          :label="$t('loginButton')"
        />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  normalizeLocaleCode,
  persistLocaleCode,
} from "~/composables/useLocalePreference";
import { buildLoginRedirectLocation } from "~/composables/useSession";
import { useUserInfoStore } from "~/stores/userInfo";

const userInfoStore = useUserInfoStore();
const { userInfo } = storeToRefs(userInfoStore);
const router = useRouter();
const { locale, t } = useI18n();

const sidebarOpen = inject("sidebarOpen", ref(true));

const navbarTitle = computed(() => {
  const path = router.currentRoute.value.path.replace(/\/+$/, "") || "/";

  if (path === "/buy" || path.startsWith("/buy/")) {
    return t("buy");
  }

  return t("dashboard");
});

const isLoggedIn = computed(() => !!getAuthToken());
const avatarSrc = computed(() =>
  userInfo.value?.user?.email_md5
    ? `https://cravatar.cn/avatar/${userInfo.value.user.email_md5}?d=https://cravatar.cn/wp-content/uploads/sites/9/2024/03/lgqsza1-2.png`
    : ""
);

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
    label: `${normalizeLocaleCode(locale.value) === lang.code ? "✓ " : ""}${
      lang.flag
    } ${lang.name}`,
    onSelect: () => changeLanguage(lang.code),
  })),
]);

const profileMenuItems = computed(() => [
  [
    {
      label: t("personalProfile"),
      icon: "solar:user-circle-bold-duotone",
      onSelect: () => router.push("/user/profile"),
    },
    {
      label: t("securitySettings"),
      icon: "solar:safe-square-bold-duotone",
      onSelect: () => router.push("/user/security"),
    },
    {
      label: t("logout"),
      icon: "solar:logout-3-bold-duotone",
      onSelect: logout,
    },
  ],
]);

watch(
  locale,
  (value) => {
    locale.value = normalizeLocaleCode(value);
  },
  { immediate: true }
);

onMounted(async () => {
  locale.value = normalizeLocaleCode(locale.value);

  const path = router.currentRoute.value.path.replace(/\/+$/, "") || "/";
  const isPublic = path === "/buy" || path.startsWith("/buy/");
  if (!userInfo.value && !isPublic) {
    await userInfoStore.fetchUserInfo();
  }
});

const logout = () => {
  clearAuthToken();
  userInfoStore.clearUserInfo();
  window.location.assign(
    router.resolve(
      buildLoginRedirectLocation(router.currentRoute.value.fullPath)
    ).href
  );
};
</script>

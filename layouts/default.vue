<template>
  <div class="dashboard-shell min-h-screen text-white">
    <TopBar v-model="sidebarStore.isOpen" />
    <Sidebar v-model="sidebarStore.isOpen" />
    <main
      :class="[
        'relative pt-24 pr-4 pb-6',
        sidebarStore.isMobile
          ? 'pl-4'
          : [
              'transition-all duration-300 ease-in-out',
              sidebarStore.isOpen ? 'pl-69' : 'pl-23',
            ],
      ]"
    >
      <div class="mx-auto w-full max-w-[1800px]">
        <slot />
      </div>
    </main>

    <div
      v-if="sidebarStore.isOpen && sidebarStore.isMobile"
      class="fixed inset-0 z-10 bg-black/70 backdrop-blur-sm"
      @click="sidebarStore.setIsOpen(false)"
    />
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Sidebar from "~/components/Sidebar.vue";
import TopBar from "~/components/TopBar.vue";
import { normalizeLocaleCode } from "~/composables/useLocalePreference";
import { useAffStore } from "~/stores/aff";
import { useAlertStore } from "~/stores/alert";
import { useSidebarStore } from "~/stores/sidebar";
import { useUserInfoStore } from "~/stores/userInfo";

const sidebarStore = useSidebarStore();
const userInfoStore = useUserInfoStore();
const isMobile = ref(false);
const { locale } = useI18n();
const router = useRouter();
const alertStore = useAlertStore();

const handleResize = () => {
  if (!process.client) {
    return;
  }

  isMobile.value = window.innerWidth < 1024;
  sidebarStore.setIsMobile(isMobile.value);
};

const redirectToLogin = () => {
  router.push({
    path: "/auth/login",
    query: {
      redirect_uri: router.currentRoute.value.fullPath,
    },
  });
};

const checkLoginStatus = async () => {
  const token = getAuthToken();

  if (!token) {
    alertStore.showAlert("请先登录", "error");
    redirectToLogin();
    return;
  }

  await userInfoStore.fetchUserInfo();
};

onMounted(async () => {
  useAffStore();
  await checkLoginStatus();
  handleResize();
  window.addEventListener("resize", handleResize);

  const savedLocale = document.cookie.replace(
    /(?:(?:^|.*;\s*)i18n_redirected\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );

  locale.value = normalizeLocaleCode(savedLocale || locale.value);
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("resize", handleResize);
  }
});
</script>

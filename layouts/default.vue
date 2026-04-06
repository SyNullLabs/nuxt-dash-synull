<template>
  <UDashboardGroup class="dashboard-shell">
    <Sidebar />

    <UDashboardPanel>
      <template #header>
        <TopBar />
      </template>

      <template #body>
        <div class="mx-auto w-full max-w-[1800px]">
          <slot />
        </div>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
<script setup>
 import { onMounted } from "vue";
 import { useI18n } from "vue-i18n";
 import { useRouter } from "vue-router";
 import Sidebar from "~/components/Sidebar.vue";
 import TopBar from "~/components/TopBar.vue";
 import { normalizeLocaleCode } from "~/composables/useLocalePreference";
 import { buildLoginRedirectLocation } from "~/composables/useSession";
 import { useAffStore } from "~/stores/aff";
 import { useAlertStore } from "~/stores/alert";
 import { useUserInfoStore } from "~/stores/userInfo";
 
 const userInfoStore = useUserInfoStore();
 const { locale } = useI18n();
 const router = useRouter();
 const alertStore = useAlertStore();
 
const redirectToLogin = () => {
  router.push(buildLoginRedirectLocation(router.currentRoute.value.fullPath));
};

const checkLoginStatus = async () => {
  // Skip auth check on public pages and auth routes to avoid redirect loops.
  const path = router.currentRoute.value.path.replace(/\/+$/, "") || "/";
  if (
    path === "/buy" ||
    path.startsWith("/buy/") ||
    path.startsWith("/auth/")
  ) {
    return;
  }

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
 
   const savedLocale = document.cookie.replace(
     /(?:(?:^|.*;\s*)i18n_redirected\s*=\s*([^;]*).*$)|^.*$/,
     "$1"
   );
 
   locale.value = normalizeLocaleCode(savedLocale || locale.value);
 });
 </script>

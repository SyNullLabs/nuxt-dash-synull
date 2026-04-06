<template>
  <div class="dashboard-shell flex min-h-screen text-[color:var(--ui-text)]">
    <Sidebar />

    <div
      class="flex min-w-0 flex-1 flex-col overflow-hidden bg-default lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow-sm peer-data-[variant=inset]:ring peer-data-[variant=inset]:ring-default"
    >
      <TopBar />

      <main class="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6">
        <div class="mx-auto w-full max-w-[1800px]">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
 import { onMounted, provide, ref } from "vue";

 const sidebarOpen = ref(true);
 provide("sidebarOpen", sidebarOpen);
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

<template>
  <div class="dashboard-shell flex h-screen text-[color:var(--ui-text)]">
    <Sidebar />

    <div
      class="relative flex min-w-0 flex-1 flex-col bg-default lg:peer-data-[variant=floating]:my-4 lg:peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 lg:peer-data-[variant=inset]:rounded-xl lg:peer-data-[variant=inset]:shadow-sm lg:peer-data-[variant=inset]:ring lg:peer-data-[variant=inset]:ring-default"
    >
      <TopBar />

      <main
        id="dashboard-main"
        ref="mainRef"
        class=" min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6"
      >
        <div
          id="dashboard-floating-overlays"
          :style="floatingOverlayStyle"
          class="pointer-events-none absolute inset-x-0 overflow-x-clip"
        ></div>
        <div
          ref="pageLayerRef"
          id="dashboard-page-layer"
          class="relative mx-auto w-full max-w-[1800px]"
        >
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
import { nextTick, onBeforeUnmount, onMounted, provide, ref } from "vue";

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
const mainRef = ref(null);
const pageLayerRef = ref(null);
const floatingOverlayStyle = ref({
  top: "0px",
  height: "0px",
});

let overlayResizeObserver = null;

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

const syncFloatingOverlayFrame = () => {
  if (!mainRef.value || !pageLayerRef.value) {
    return;
  }

  const mainRect = mainRef.value.getBoundingClientRect();
  const pageLayerRect = pageLayerRef.value.getBoundingClientRect();

  floatingOverlayStyle.value = {
    top: `${Math.max(pageLayerRect.top - mainRect.top, 0)}px`,
    height: `${Math.max(pageLayerRect.height, 0)}px`,
  };
};

onMounted(async () => {
  useAffStore();
  await checkLoginStatus();

  const savedLocale = document.cookie.replace(
    /(?:(?:^|.*;\s*)i18n_redirected\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );

  locale.value = normalizeLocaleCode(savedLocale || locale.value);
  await nextTick();
  syncFloatingOverlayFrame();

  overlayResizeObserver = new ResizeObserver(syncFloatingOverlayFrame);
  overlayResizeObserver.observe(mainRef.value);
  overlayResizeObserver.observe(pageLayerRef.value);
  window.addEventListener("resize", syncFloatingOverlayFrame);
});

onBeforeUnmount(() => {
  overlayResizeObserver?.disconnect();
  window.removeEventListener("resize", syncFloatingOverlayFrame);
});
</script>

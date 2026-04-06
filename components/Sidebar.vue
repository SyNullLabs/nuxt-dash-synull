<template>
  <USidebar
    v-model:open="sidebarOpen"
    collapsible="icon"
    rail
    variant="inset"
    style="--sidebar-width: 20rem"
  >
    <template #header="{ state }">
      <UButton
        :to="brandHref"
        size="lg"
        color="neutral"
        variant="ghost"
        square
        label="SYNULL"
        icon="solar:home-2-bold-duotone"
        class="w-full overflow-hidden"
      />
    </template>

    <template #default="{ state }">
      <UNavigationMenu
        size="lg"
        vertical="soft"
        :items="navigationItems"
        orientation="vertical"
        :ui="{ link: 'p-1.5 overflow-hidden' }"
      />
    </template>

    <template #footer="{ state }">
      <div v-if="showFooterActions" class="w-full">
        <UButton
          v-if="isLoggedIn"
          icon="solar:logout-2-bold-duotone"
          size="lg"
          color="error"
          variant="ghost"
          square
          :label="$t('logout')"
          :title="$t('logout')"
          :aria-label="$t('logout')"
          class="w-full overflow-hidden"
          @click="handleLogout"
        />

        <div v-else class="grid w-full gap-2">
          <UButton
            v-if="showGuestLogin"
            icon="solar:user-circle-bold-duotone"
            color="primary"
            variant="soft"
            square
            :label="$t('loginButton')"
            :title="$t('loginButton')"
            :aria-label="$t('loginButton')"
            class=" overflow-hidden"
            @click="goToLogin"
          />

          <UButton
            v-if="showGuestRegister"
            icon="solar:user-id-bold-duotone"
            color="neutral"
            variant="ghost"
            square
            :label="$t('register')"
            :title="$t('register')"
            :aria-label="$t('register')"
            class="overflow-hidden"
            @click="goToRegister"
          />
        </div>
      </div>
    </template>
  </USidebar>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAuthMethods } from "~/composables/useAuthMethods";
import { buildLoginRedirectLocation } from "~/composables/useSession";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const { methods, loadAuthMethods } = useAuthMethods();

const sidebarOpen = inject("sidebarOpen", ref(true));

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

const createLinkItem = (item) => {
  const currentPath = normalizePath(route.path);
  const itemPath = normalizePath(item.href);
  const isActive = item.activeMatch
    ? item.activeMatch(currentPath)
    : itemPath === "/"
      ? currentPath === "/"
      : currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);

  return {
    label: t(item.label),
    icon: item.icon,
    to: item.href,
    exact: item.href === "/",
    active: isActive,
  };
};

const isLoggedIn = computed(() => Boolean(authStore.token || getAuthToken()));
const brandHref = computed(() => (isLoggedIn.value ? "/" : "/buy"));

const memberNavigationItems = computed(() => [
  [
    createLinkItem({
      href: "/",
      icon: "solar:home-2-bold-duotone",
      label: "home",
    }),
    createLinkItem({
      href: "/buy",
      icon: "solar:cart-bold-duotone",
      label: "buy",
    }),
    createLinkItem({
      href: "/cart",
      icon: "solar:cart-large-bold-duotone",
      label: "shoppingCart",
      activeMatch: (path) => path === "/cart" || path === "/checkout",
    }),
  ],
  [
    {
      label: t("productManagement"),
      icon: "solar:widget-2-bold-duotone",
      defaultOpen: route.path.startsWith("/products"),
      children: [
        createLinkItem({
          href: "/products/cvm",
          icon: "solar:cloud-bolt-minimalistic-line-duotone",
          label: "cloudVirtualMachine",
        }),
        createLinkItem({
          href: "/products/tcvm",
          icon: "solar:cloud-storm-line-duotone",
          label: "trafficCloudVirtualMachine",
        }),
        createLinkItem({
          href: "/products/host",
          icon: "solar:global-line-duotone",
          label: "virtualHosts",
        }),
      ],
    },
    createLinkItem({
      href: "/tickets",
      icon: "solar:clipboard-text-bold-duotone",
      label: "tickets",
    }),
  ],
  [
    {
      label: t("userCenter"),
      icon: "solar:user-bold-duotone",
      defaultOpen: route.path.startsWith("/user"),
      children: [
        createLinkItem({
          href: "/user/profile",
          icon: "solar:user-id-bold-duotone",
          label: "personalProfile",
        }),
        createLinkItem({
          href: "/user/security",
          icon: "solar:shield-keyhole-bold-duotone",
          label: "securitySettings",
        }),
        createLinkItem({
          href: "/user/verify",
          icon: "solar:verified-check-bold-duotone",
          label: "realNameVerify",
        }),
        createLinkItem({
          href: "/user/contacts",
          icon: "solar:users-group-rounded-bold-duotone",
          label: "subAccounts",
        }),
        createLinkItem({
          href: "/user/api",
          icon: "solar:key-bold-duotone",
          label: "apiManagement",
        }),
        createLinkItem({
          href: "/user/credit",
          icon: "solar:wallet-bold-duotone",
          label: "creditManagement",
        }),
        createLinkItem({
          href: "/user/invoice",
          icon: "solar:document-text-bold-duotone",
          label: "invoiceManagement",
        }),
        createLinkItem({
          href: "/user/logs",
          icon: "solar:list-bold-duotone",
          label: "operationLogs",
        }),
        createLinkItem({
          href: "/user/affiliate",
          icon: "solar:share-bold-duotone",
          label: "affiliateProgram",
        }),
      ],
    },
  ],
]);

const guestNavigationItems = computed(() => [
  [
    createLinkItem({
      href: "/buy",
      icon: "solar:cart-bold-duotone",
      label: "buy",
    }),
  ],
]);

const navigationItems = computed(() =>
  isLoggedIn.value ? memberNavigationItems.value : guestNavigationItems.value
);

const hasEnabledMethod = (methodGroup) =>
  !!methodGroup && Object.values(methodGroup).some(Boolean);

const showGuestLogin = computed(() =>
  !isLoggedIn.value && (!methods.value || hasEnabledMethod(methods.value.login))
);

const showGuestRegister = computed(
  () =>
    !isLoggedIn.value &&
    (!methods.value || hasEnabledMethod(methods.value.register))
);

const showFooterActions = computed(
  () => isLoggedIn.value || showGuestLogin.value || showGuestRegister.value
);

const goToLogin = () => {
  router.push(buildLoginRedirectLocation(route.fullPath));
};

const goToRegister = () => {
  router.push("/auth/register");
};

const handleLogout = async () => {
  const api = useApiClient();

  try {
    await api("/auth/logout");
  } catch (error) {
    console.warn("Failed to notify logout endpoint", error);
  }

  authStore.logout();
  router.push("/auth/login");
};

onMounted(() => {
  if (!isLoggedIn.value) {
    loadAuthMethods();
  }
});
</script>

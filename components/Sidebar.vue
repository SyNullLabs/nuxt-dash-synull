<template>
  <USidebar
    v-model:open="sidebarOpen"
    collapsible="icon"
    rail
    variant="inset"
    style="--sidebar-width: 22rem; --sidebar-width-icon: 5rem"
    :ui="sidebarUi"
  >
    <template #header>
      <UButton
        :to="brandHref"
        size="xl"
        color="neutral"
        variant="ghost"
        square
        label="SYNULL"
        title="SYNULL"
        aria-label="SYNULL"
        icon="solar:home-2-bold-duotone"
        class="w-full overflow-hidden"
      />
    </template>

    <template #default>
      <UNavigationMenu
        :items="navigationItems"
        orientation="vertical"
        :ui="navigationUi"
      />
    </template>

    <template #footer>
      <UDropdownMenu
        v-if="showFooterActions"
        :items="footerMenuItems"
        :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
      >
        <UButton
          v-bind="footerUserTrigger"
          trailing-icon="i-lucide-chevrons-up-down"
          size="xl"
          color="neutral"
          variant="ghost"
          square
          :title="footerUserLabel"
          :aria-label="footerUserLabel"
          class="w-full data-[state=open]:bg-elevated overflow-hidden"
          :ui="{ trailingIcon: 'text-dimmed ms-auto' }"
        />
      </UDropdownMenu>
    </template>
  </USidebar>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { computed, inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAuthMethods } from "~/composables/useAuthMethods";
import { buildLoginRedirectLocation } from "~/composables/useSession";
import { useAuthStore } from "~/stores/auth";
import { useUserInfoStore } from "~/stores/userInfo";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const userInfoStore = useUserInfoStore();
const { methods, loadAuthMethods } = useAuthMethods();
const { userInfo } = storeToRefs(userInfoStore);

const sidebarOpen = inject("sidebarOpen", ref(true));

const sidebarUi = {
  header: "gap-2.5 px-5 py-4",
  body: "gap-5 px-5 py-5",
  footer: "gap-2.5 px-5 py-5",
};

const navigationUi = {
  label: "px-2 py-2 text-sm/6 font-semibold text-highlighted",
  link: "min-h-12 gap-2 overflow-hidden rounded-md p-2 text-base font-medium transition-colors",
  linkLeadingIcon: "size-6 shrink-0",
  linkTrailing: "ms-auto inline-flex items-center gap-2 group-data-[state=collapsed]/sidebar:hidden",
  linkTrailingIcon: "size-5",
  linkLabel: "min-w-0 truncate",
  childList: "ms-6",
  childLabel: "px-2 py-1 text-xs/6",
  childLink: "min-h-11 gap-2 rounded-lg p-2.5 text-sm",
  childLinkIcon: "size-5",
  content: "group-data-[state=collapsed]/sidebar:hidden",
};

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

const footerUserLabel = computed(
  () => userInfo.value?.user?.username || t("userCenter")
);

const footerUserTrigger = computed(() => ({
  label: footerUserLabel.value,
  icon: "solar:user-circle-bold-duotone",
}));

const footerMenuItems = computed(() => {
  if (isLoggedIn.value) {
    return [
      [
        {
          label: footerUserLabel.value,
          icon: "solar:user-circle-bold-duotone",
          type: "label",
        },
      ],
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
          color: "error",
          onSelect: handleLogout,
        },
      ],
    ];
  }

  const guestItems = [
    [
      {
        label: footerUserLabel.value,
        icon: "solar:user-circle-bold-duotone",
        type: "label",
      },
    ],
  ];
  const guestActions = [];

  if (showGuestLogin.value) {
    guestActions.push({
      label: t("loginButton"),
      icon: "solar:user-circle-bold-duotone",
      onSelect: goToLogin,
    });
  }

  if (showGuestRegister.value) {
    guestActions.push({
      label: t("register"),
      icon: "solar:user-id-bold-duotone",
      onSelect: goToRegister,
    });
  }

  if (guestActions.length) {
    guestItems.push(guestActions);
  }

  return guestItems;
});

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

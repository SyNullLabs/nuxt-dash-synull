<template>
  <UDashboardSidebar
    id="synull-sidebar"
    collapsible
    resizable
    :default-size="18"
    :min-size="14"
    :max-size="24"
  >
    <template #header="{ collapsed }">
      <UButton
        to="/"
        color="neutral"
        variant="ghost"
        :label="collapsed ? undefined : 'SYNULL'"
        icon="solar:home-2-bold-duotone"
        class="w-full justify-start"
      />
    </template>

    <template #default="{ collapsed }">
      <div class="flex h-full flex-col gap-3 p-3">
        <UNavigationMenu
          :items="navigationItems"
          orientation="vertical"
          :collapsed="collapsed"
          highlight
          highlight-color="primary"
          type="multiple"
          collapsible
          class="min-h-0 flex-1 overflow-y-auto"
        />

        <USeparator />

        <UButton
          icon="solar:logout-2-bold-duotone"
          color="error"
          variant="ghost"
          :label="collapsed ? undefined : $t('logout')"
          :title="collapsed ? $t('logout') : undefined"
          :aria-label="$t('logout')"
          class="w-full justify-start"
          @click="handleLogout"
        />
      </div>
    </template>
  </UDashboardSidebar>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const createLinkItem = (item) => ({
  label: t(item.label),
  icon: item.icon,
  to: item.href,
  exact: item.href === "/",
});

const navigationItems = computed(() => [
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

const handleLogout = async () => {
  const api = useApiClient();

  try {
    await api("/auth/logout");
  } catch (error) {
    console.warn("Failed to notify logout endpoint", error);
  }

  const authStore = useAuthStore();
  authStore.logout();
  router.push("/auth/login");
};
</script>

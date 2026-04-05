<template>
  <div>
    <div class="mb-5 flex items-center gap-2">
      <UButton
        to="/buy"
        variant="ghost"
        color="neutral"
        icon="i-solar-arrow-left-outline"
        size="sm"
        class="text-white/50"
      />
      <h1 class="text-xl font-semibold text-white">{{ t("configureProduct") }}</h1>
    </div>

    <nav
      v-if="!loading && !catalogLoading && hasCatalogGroups"
      class="mb-5 flex gap-1 overflow-x-auto border-b border-white/8 pb-px"
    >
      <button
        v-for="group in catalogGroups"
        :key="group.id"
        type="button"
        :class="[
          'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
          String(resolvedCatalogGroupId) === String(group.id)
            ? 'border-synull text-synull'
            : 'border-transparent text-white/45 hover:text-white/70',
        ]"
        @click="activeCatalogGroupId = group.id"
      >
        <Icon v-if="group.icon" :name="group.icon" class="text-sm" />
        {{ group.name }}
        <span class="text-xs opacity-60">({{ group.items.length }})</span>
      </button>
    </nav>

    <div
      v-if="!loading && !catalogLoading && visibleCatalogProducts.length > 1"
      class="mb-5 flex flex-wrap gap-2"
    >
      <button
        v-for="product in visibleCatalogProducts"
        :key="product.id"
        type="button"
        :class="[
          'rounded-full border px-3 py-1.5 text-sm transition-colors',
          String(product.id || '') === productId
            ? 'border-synull/40 bg-synull/10 text-synull'
            : 'border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white/78',
        ]"
        @click="navigateTo(`/buy/${product.id}`)"
      >
        {{ product.name || product.id }}
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="dashboard-panel rounded-2xl p-5">
        <USkeleton class="mb-3 h-6 w-48 rounded-lg" />
        <USkeleton class="mb-2 h-4 w-full rounded-lg" />
        <USkeleton class="h-4 w-2/3 rounded-lg" />
      </div>
    </div>

    <div v-else-if="error" class="dashboard-panel rounded-2xl p-8 text-center">
      <Icon name="solar:danger-triangle-bold-duotone" class="mx-auto mb-3 text-4xl text-yellow-500" />
      <p class="mb-4 text-white/60">{{ t("loadConfigFailed") }}</p>
      <UButton @click="loadConfig" variant="soft" :label="t('retry')" />
    </div>

    <div v-else class="grid gap-5 lg:grid-cols-3">
      <!-- Configuration options -->
      <div class="space-y-4 lg:col-span-2">
        <!-- Billing cycle -->
        <div v-if="config.billingcycles" class="dashboard-panel rounded-2xl p-5">
          <h3 class="mb-3 text-sm font-medium text-white/50">{{ t("billingCycle") }}</h3>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="(cycle, key) in config.billingcycles"
              :key="key"
              :variant="selectedCycle === key ? 'solid' : 'ghost'"
              :color="selectedCycle === key ? 'primary' : 'neutral'"
              @click="selectedCycle = key"
              size="sm"
            >
              {{ cycle.name || key }}
            </UButton>
          </div>
        </div>

        <!-- Config options -->
        <div
          v-for="(option, key) in config.configoptions"
          :key="key"
          class="dashboard-panel rounded-2xl p-5"
        >
          <h3 class="mb-3 text-sm font-medium text-white/50">
            {{ option.name || key }}
          </h3>
          <div v-if="option.type === 'select' || option.options" class="flex flex-wrap gap-2">
            <UButton
              v-for="(opt, optKey) in option.options"
              :key="optKey"
              :variant="selectedOptions[key] === optKey ? 'solid' : 'ghost'"
              :color="selectedOptions[key] === optKey ? 'primary' : 'neutral'"
              @click="selectOption(key, optKey)"
              size="sm"
            >
              {{ opt.name || opt }}
            </UButton>
          </div>
          <UInput
            v-else-if="option.type === 'text'"
            v-model="selectedOptions[key]"
            :placeholder="option.placeholder || ''"
            class="max-w-xs"
          />
        </div>

        <!-- Custom fields -->
        <div
          v-for="(field, key) in config.customfields"
          :key="'cf-' + key"
          class="dashboard-panel rounded-2xl p-5"
        >
          <h3 class="mb-3 text-sm font-medium text-white/50">
            {{ field.name || key }}
          </h3>
          <UInput
            v-model="customFields[key]"
            :placeholder="field.placeholder || ''"
            class="max-w-xs"
          />
        </div>
      </div>

      <!-- Order summary sidebar -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 space-y-4">
          <div class="dashboard-panel rounded-2xl p-5">
            <h3 class="mb-4 text-sm font-medium text-white/50">{{ t("orderSummary") }}</h3>

            <div v-if="priceLoading" class="space-y-2">
              <USkeleton class="h-4 w-full rounded" />
              <USkeleton class="h-4 w-3/4 rounded" />
            </div>
            <div v-else>
              <div v-if="priceInfo.items" class="space-y-2 border-b border-white/8 pb-3 mb-3">
                <div
                  v-for="(item, idx) in priceInfo.items"
                  :key="idx"
                  class="flex justify-between text-sm"
                >
                  <span class="text-white/50">{{ item.label }}</span>
                  <span class="text-white">{{ item.value }}</span>
                </div>
              </div>
              <div class="flex items-baseline justify-between">
                <span class="text-sm text-white/50">{{ t("total") }}</span>
                <span class="text-xl font-semibold text-synull">
                  {{ priceInfo.total || "—" }}
                </span>
              </div>
              <p v-if="priceError" class="mt-3 text-xs text-red-300/80">
                {{ priceError }}
              </p>
            </div>
          </div>

          <UButton
            block
            :loading="addingToCart"
            :disabled="!canSubmitOrder"
            @click="addToCart"
            icon="i-solar-cart-plus-bold-duotone"
          >
            {{ t("addToCart") }}
          </UButton>

          <UButton
            block
            variant="soft"
            :loading="addingToCart"
            :disabled="!canSubmitOrder"
            @click="addToCart(true)"
            icon="i-solar-bag-check-bold-duotone"
          >
            {{ t("buyNow") }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "#imports";
import { computed, ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { buildLoginRedirectLocation } from "~/composables/useSession";
import { useAuthStore } from "~/stores/auth";
import { normalizeBuyCatalogGroups } from "~/utils/buy-catalog";

const { t } = useI18n();
const route = useRoute();
const api = useApiClient();
const toast = useToast();

const productId = computed(() => String(route.params.id || ""));
const loading = ref(true);
const error = ref(false);
const catalogLoading = ref(true);
const config = ref({});
const catalogGroups = ref([]);
const activeCatalogGroupId = ref(null);
const selectedCycle = ref("");
const selectedOptions = reactive({});
const customFields = reactive({});
const priceInfo = ref({});
const priceLoading = ref(false);
const priceError = ref("");
const addingToCart = ref(false);

const hasResolvedPrice = computed(() => {
  const total = priceInfo.value?.total;
  return total !== undefined && total !== null && `${total}` !== "";
});

const canSubmitOrder = computed(
  () => !priceLoading.value && !priceError.value && hasResolvedPrice.value
);

const hasCatalogGroups = computed(() =>
  catalogGroups.value.some((group) => Boolean(group.name))
);

const currentCatalogGroup = computed(
  () =>
    catalogGroups.value.find((group) =>
      group.items.some(
        (product) => String(product.id || "") === productId.value
      )
    ) || null
);

const resolvedCatalogGroupId = computed(() => {
  const activeId = activeCatalogGroupId.value;

  if (
    activeId !== null &&
    catalogGroups.value.some((group) => String(group.id) === String(activeId))
  ) {
    return activeId;
  }

  return currentCatalogGroup.value?.id ?? null;
});

const visibleCatalogProducts = computed(() => {
  const group = catalogGroups.value.find(
    (candidate) =>
      String(candidate.id) === String(resolvedCatalogGroupId.value)
  );

  return group?.items || [];
});

const resetProductConfigState = () => {
  config.value = {};
  selectedCycle.value = "";
  priceInfo.value = {};
  priceError.value = "";

  for (const key of Object.keys(selectedOptions)) {
    delete selectedOptions[key];
  }

  for (const key of Object.keys(customFields)) {
    delete customFields[key];
  }
};

const syncActiveCatalogGroup = () => {
  activeCatalogGroupId.value = currentCatalogGroup.value?.id ?? null;
};

const selectOption = (key, value) => {
  selectedOptions[key] = value;
};

const loadCatalogGroups = async () => {
  catalogLoading.value = true;

  try {
    const res = await api("/cart/products");
    catalogGroups.value =
      res?.success && res.data ? normalizeBuyCatalogGroups(res.data) : [];
  } catch {
    catalogGroups.value = [];
  } finally {
    catalogLoading.value = false;
    syncActiveCatalogGroup();
  }
};

const loadConfig = async () => {
  loading.value = true;
  error.value = false;
  resetProductConfigState();

  try {
    const res = await api("/cart/config", { query: { pid: productId.value } });
    if (res?.success && res.data) {
      config.value = res.data;
      // Set defaults
      if (res.data.billingcycles) {
        const keys = Object.keys(res.data.billingcycles);
        if (keys.length) selectedCycle.value = keys[0];
      }
      if (res.data.configoptions) {
        for (const [key, option] of Object.entries(res.data.configoptions)) {
          if (option.options) {
            const optKeys = Object.keys(option.options);
            if (optKeys.length) selectedOptions[key] = optKeys[0];
          }
        }
      }
    } else {
      error.value = true;
    }
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const calcPrice = async () => {
  priceLoading.value = true;
  priceError.value = "";
  try {
    const res = await api("/cart/total", {
      method: "POST",
      body: {
        pid: productId.value,
        billingcycle: selectedCycle.value,
        configoption: selectedOptions,
        customfield: customFields,
      },
    });
    if (res?.success && res.data) {
      priceInfo.value = res.data;
      return;
    }
    priceInfo.value = {};
    priceError.value = res?.message || t("operationFailed");
  } catch (error) {
    priceInfo.value = {};
    priceError.value =
      error?.data?.message || error?.message || t("operationFailed");
  } finally {
    priceLoading.value = false;
  }
};

const addToCart = async (checkout = false) => {
  // Require login for cart actions
  const authStore = useAuthStore();
  if (!authStore.token) {
    navigateTo(buildLoginRedirectLocation(route.fullPath));
    return;
  }

  if (!canSubmitOrder.value) {
    toast.add({ title: priceError.value || t("operationFailed"), color: "error" });
    return;
  }

  addingToCart.value = true;
  try {
    const res = await api("/cart/add", {
      method: "POST",
      body: {
        pid: productId.value,
        billingcycle: selectedCycle.value,
        configoption: selectedOptions,
        customfield: customFields,
        checkout: checkout ? 1 : 0,
      },
    });
    if (res?.success) {
      toast.add({ title: t("addToCartSuccess"), color: "success" });
      if (checkout) {
        navigateTo("/checkout");
      } else {
        navigateTo("/cart");
      }
    } else {
      toast.add({ title: res?.message || t("addToCartFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("addToCartFailed"), color: "error" });
  } finally {
    addingToCart.value = false;
  }
};

// Recalculate price when options change
let priceTimer = null;
watch([selectedCycle, selectedOptions, customFields], () => {
  clearTimeout(priceTimer);
  priceTimer = setTimeout(calcPrice, 500);
}, { deep: true });

onMounted(async () => {
  await Promise.all([loadCatalogGroups(), loadConfig()]);
  if (!error.value) calcPrice();
});

watch(
  productId,
  async (nextId, previousId) => {
    if (nextId === previousId) {
      return;
    }

    syncActiveCatalogGroup();
    await loadConfig();
    if (!error.value) calcPrice();
  }
);
</script>

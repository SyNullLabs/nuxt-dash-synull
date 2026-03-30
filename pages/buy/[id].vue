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
            </div>
          </div>

          <UButton
            block
            :loading="addingToCart"
            @click="addToCart"
            icon="i-solar-cart-plus-bold-duotone"
          >
            {{ t("addToCart") }}
          </UButton>

          <UButton
            block
            variant="soft"
            :loading="addingToCart"
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
import { ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const api = useApiClient();
const toast = useToast();

const productId = route.params.id;
const loading = ref(true);
const error = ref(false);
const config = ref({});
const selectedCycle = ref("");
const selectedOptions = reactive({});
const customFields = reactive({});
const priceInfo = ref({});
const priceLoading = ref(false);
const addingToCart = ref(false);

const selectOption = (key, value) => {
  selectedOptions[key] = value;
};

const loadConfig = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await api("/cart/config", { query: { pid: productId } });
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
  try {
    const res = await api("/cart/total", {
      method: "POST",
      body: {
        pid: productId,
        billingcycle: selectedCycle.value,
        configoption: selectedOptions,
        customfield: customFields,
      },
    });
    if (res?.success && res.data) {
      priceInfo.value = res.data;
    }
  } catch {
    // Silent fail for price calculation
  } finally {
    priceLoading.value = false;
  }
};

const addToCart = async (checkout = false) => {
  addingToCart.value = true;
  try {
    const res = await api("/cart/add", {
      method: "POST",
      body: {
        pid: productId,
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
watch([selectedCycle, selectedOptions], () => {
  clearTimeout(priceTimer);
  priceTimer = setTimeout(calcPrice, 500);
});

onMounted(async () => {
  await loadConfig();
  if (!error.value) calcPrice();
});
</script>
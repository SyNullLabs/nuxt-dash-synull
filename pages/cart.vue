<template>
  <div>
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-white">{{ t("shoppingCart") }}</h1>
      <UButton
        v-if="cartItems.length"
        variant="ghost"
        color="error"
        icon="i-solar-trash-bin-2-bold-duotone"
        :label="t('clearCart')"
        :loading="clearing"
        @click="clearCart"
      />
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 2" :key="n" class="dashboard-panel rounded-2xl p-5">
        <USkeleton class="mb-2 h-5 w-48 rounded-lg" />
        <USkeleton class="h-4 w-full rounded-lg" />
      </div>
    </div>

    <div v-else-if="cartItems.length === 0" class="dashboard-panel rounded-2xl p-12 text-center">
      <Icon name="solar:cart-large-bold-duotone" class="mx-auto mb-4 text-5xl text-white/15" />
      <p class="mb-1 text-lg text-white/60">{{ t("cartEmpty") }}</p>
      <p class="mb-5 text-sm text-white/35">{{ t("cartEmptyHint") }}</p>
      <UButton to="/buy" variant="soft" icon="i-solar-bag-4-bold-duotone">
        {{ t("browseProducts") }}
      </UButton>
    </div>

    <div v-else class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-3 lg:col-span-2">
        <div
          v-for="(item, idx) in cartItems"
          :key="idx"
          class="dashboard-panel group rounded-2xl p-5"
        >
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <h3 class="mb-1 text-base font-medium text-white">{{ item.name }}</h3>
              <p class="mb-2 text-sm text-white/45">
                {{ item.billingcycle_text || item.billingcycle }}
              </p>
              <div v-if="item.options" class="flex flex-wrap gap-1">
                <span
                  v-for="(opt, oKey) in item.options"
                  :key="oKey"
                  class="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/40"
                >
                  {{ opt }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-base font-medium text-synull whitespace-nowrap">
                {{ item.price || item.amount }}
              </span>
              <UButton
                variant="ghost"
                color="error"
                icon="i-solar-close-circle-bold-duotone"
                size="xs"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeItem(idx)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: promo & checkout -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 space-y-4">
          <!-- Promo code -->
          <div class="dashboard-panel rounded-2xl p-5">
            <h3 class="mb-3 text-sm font-medium text-white/50">{{ t("promoCode") }}</h3>
            <div class="flex gap-2">
              <UInput
                v-model="promoCode"
                :placeholder="t('enterPromoCode')"
                class="flex-1"
                size="sm"
              />
              <UButton
                size="sm"
                variant="soft"
                :loading="applyingPromo"
                @click="applyPromo"
              >
                {{ t("apply") }}
              </UButton>
            </div>
          </div>

          <!-- Total -->
          <div class="dashboard-panel rounded-2xl p-5">
            <div v-if="cartData?.subtotal" class="mb-3 space-y-2 border-b border-white/8 pb-3">
              <div class="flex justify-between text-sm">
                <span class="text-white/50">{{ t("subtotal") }}</span>
                <span class="text-white">{{ cartData.subtotal }}</span>
              </div>
              <div v-if="cartData.discount" class="flex justify-between text-sm">
                <span class="text-white/50">{{ t("discount") }}</span>
                <span class="text-green-400">-{{ cartData.discount }}</span>
              </div>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-sm text-white/50">{{ t("total") }}</span>
              <span class="text-xl font-semibold text-synull">
                {{ cartData?.total || "—" }}
              </span>
            </div>
          </div>

          <UButton block @click="goCheckout" icon="i-solar-bag-check-bold-duotone">
            {{ t("proceedToCheckout") }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();

const loading = ref(true);
const clearing = ref(false);
const applyingPromo = ref(false);
const cartItems = ref([]);
const cartData = ref(null);
const promoCode = ref("");

const loadCart = async () => {
  loading.value = true;
  try {
    const res = await api("/cart/list");
    if (res?.success && res.data) {
      cartData.value = res.data;
      cartItems.value = res.data.items || res.data.products || [];
    }
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
};

const removeItem = async (idx) => {
  try {
    const res = await api("/cart/remove", {
      method: "POST",
      body: { i: idx },
    });
    if (res?.success) {
      toast.add({ title: t("itemRemoved"), color: "success" });
      await loadCart();
    } else {
      toast.add({ title: res?.message || t("removeFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("removeFailed"), color: "error" });
  }
};

const clearCart = async () => {
  clearing.value = true;
  try {
    const res = await api("/cart/clear", { method: "POST" });
    if (res?.success) {
      cartItems.value = [];
      cartData.value = null;
      toast.add({ title: t("cartCleared"), color: "success" });
    }
  } catch {
    toast.add({ title: t("clearFailed"), color: "error" });
  } finally {
    clearing.value = false;
  }
};

const applyPromo = async () => {
  if (!promoCode.value) return;
  applyingPromo.value = true;
  try {
    const res = await api("/cart/promo", {
      method: "POST",
      body: { action: "add", promo: promoCode.value },
    });
    if (res?.success) {
      toast.add({ title: t("promoApplied"), color: "success" });
      await loadCart();
    } else {
      toast.add({ title: res?.message || t("promoFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("promoFailed"), color: "error" });
  } finally {
    applyingPromo.value = false;
  }
};

const goCheckout = () => navigateTo("/checkout");

onMounted(loadCart);
</script>
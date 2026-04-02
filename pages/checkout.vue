<template>
  <div>
    <div class="mb-5 flex items-center gap-2">
      <UButton
        to="/cart"
        variant="ghost"
        color="neutral"
        icon="i-solar-arrow-left-outline"
        size="sm"
        class="text-white/50"
      />
      <h1 class="text-xl font-semibold text-white">{{ t("checkout") }}</h1>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="dashboard-panel rounded-2xl p-5">
        <USkeleton class="h-6 w-48 rounded-lg" />
      </div>
    </div>

    <div v-else class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <!-- Payment methods -->
        <div class="dashboard-panel rounded-2xl p-5">
          <h3 class="mb-4 text-sm font-medium text-white/50">{{ t("selectPayment") }}</h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              @click="selectedPayment = method.id"
              :class="[
                'cursor-pointer rounded-xl border p-4 transition-all duration-200',
                selectedPayment === method.id
                  ? 'border-synull/40 bg-synull/8'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/16',
              ]"
            >
              <div class="flex items-center gap-3">
                <Icon
                  :name="getPaymentIcon(method)"
                  class="text-xl"
                  :class="selectedPayment === method.id ? 'text-synull' : 'text-white/40'"
                />
                <span class="text-sm font-medium text-white">{{ method.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Use balance -->
        <div v-if="gateway?.credit" class="dashboard-panel rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-white">{{ t("useBalance") }}</h3>
              <p class="mt-1 text-xs text-white/40">
                {{ t("availableBalance") }}: {{ gateway.credit }}
              </p>
            </div>
            <UToggle v-model="useCredit" />
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 space-y-4">
          <div class="dashboard-panel rounded-2xl p-5">
            <h3 class="mb-4 text-sm font-medium text-white/50">{{ t("orderSummary") }}</h3>
            <div v-if="gateway?.items" class="mb-3 space-y-2 border-b border-white/8 pb-3">
              <div
                v-for="(item, idx) in gateway.items"
                :key="idx"
                class="flex justify-between text-sm"
              >
                <span class="truncate text-white/50">{{ item.name }}</span>
                <span class="text-white">{{ item.amount }}</span>
              </div>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-sm text-white/50">{{ t("total") }}</span>
              <span class="text-xl font-semibold text-synull">
                {{ gateway?.total || "—" }}
              </span>
            </div>
          </div>

          <UButton
            block
            :loading="settling"
            :disabled="!selectedPayment"
            @click="settle"
            icon="i-solar-card-bold-duotone"
          >
            {{ t("confirmPayment") }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "#imports";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();

const loading = ref(true);
const settling = ref(false);
const gateway = ref(null);
const paymentMethods = ref([]);
const selectedPayment = ref("");
const useCredit = ref(false);

const getPaymentIcon = (method) => {
  const name = (method.name || "").toLowerCase();
  if (name.includes("alipay") || name.includes("支付宝")) return "simple-icons:alipay";
  if (name.includes("wechat") || name.includes("微信")) return "simple-icons:wechat";
  if (name.includes("paypal")) return "simple-icons:paypal";
  if (name.includes("stripe")) return "simple-icons:stripe";
  return "solar:card-bold-duotone";
};

const loadGateway = async () => {
  loading.value = true;
  try {
    const res = await api("/cart/gateway");
    if (res?.success && res.data) {
      gateway.value = res.data;
      paymentMethods.value = res.data.gateways || res.data.payment_methods || [];
      if (paymentMethods.value.length) {
        selectedPayment.value = paymentMethods.value[0].id;
      }
    }
  } catch {
    toast.add({ title: t("loadPaymentFailed"), color: "error" });
  } finally {
    loading.value = false;
  }
};

const settle = async () => {
  settling.value = true;
  try {
    const res = await api("/cart/settle", {
      method: "POST",
      body: {
        payment: selectedPayment.value,
        use_credit: useCredit.value ? 1 : 0,
      },
    });
    if (res?.success && res.data) {
      // If redirect URL returned (payment gateway), navigate there
      if (res.data.url || res.data.redirect) {
        window.location.href = res.data.url || res.data.redirect;
      } else {
        toast.add({ title: t("orderCreated"), color: "success" });
        navigateTo("/");
      }
    } else {
      toast.add({ title: res?.message || t("settleFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("settleFailed"), color: "error" });
  } finally {
    settling.value = false;
  }
};

onMounted(loadGateway);
</script>

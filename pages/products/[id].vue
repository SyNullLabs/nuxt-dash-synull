<template>
  <div>
    <div class="mb-5 flex items-center gap-2">
      <UButton
        to="/products/cvm"
        variant="ghost"
        color="neutral"
        icon="i-solar-arrow-left-outline"
        size="sm"
        class="text-white/50"
      />
      <h1 class="text-xl font-semibold text-white">{{ t("productDetail") }}</h1>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="dashboard-panel rounded-2xl p-5">
        <USkeleton class="mb-3 h-6 w-48 rounded-lg" />
        <USkeleton class="h-32 w-full rounded-lg" />
      </div>
    </div>

    <div v-else-if="error" class="dashboard-panel rounded-2xl p-8 text-center">
      <Icon name="solar:danger-triangle-bold-duotone" class="mx-auto mb-3 text-4xl text-yellow-500" />
      <p class="mb-4 text-white/60">{{ t("loadDetailFailed") }}</p>
      <UButton @click="loadDetail" variant="soft" :label="t('retry')" />
    </div>

    <div v-else class="space-y-5">
      <!-- Basic info -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="mb-1 text-lg font-semibold text-white">{{ detail.name || detail.domain }}</h2>
            <p class="text-sm text-white/45">ID: {{ detail.id }}</p>
          </div>
          <span
            :class="[
              'rounded-full px-3 py-1 text-xs font-medium',
              statusClass(detail.status),
            ]"
          >
            {{ t(detail.status || "unknown") }}
          </span>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="field in infoFields" :key="field.key" class="space-y-1">
            <p class="text-xs text-white/35">{{ field.label }}</p>
            <p class="text-sm text-white">{{ field.value || "—" }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap gap-2">
        <UButton variant="soft" size="sm" icon="i-solar-refresh-bold-duotone" @click="showRenew = true">
          {{ t("renew") }}
        </UButton>
        <UButton variant="soft" size="sm" icon="i-solar-settings-bold-duotone" @click="toggleAutoRenew">
          {{ detail.auto_renew ? t("disableAutoRenew") : t("enableAutoRenew") }}
        </UButton>
        <UButton variant="soft" color="error" size="sm" icon="i-solar-close-circle-bold-duotone" @click="showCancel = true">
          {{ t("cancelService") }}
        </UButton>
      </div>

      <!-- Modules / additional content from host/moudle -->
      <div v-if="modules && modules.length" class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="mod in modules"
          :key="mod.id || mod.name"
          class="dashboard-panel rounded-2xl p-5"
        >
          <h3 class="mb-2 text-sm font-medium text-white/60">{{ mod.name }}</h3>
          <component :is="mod.component || 'div'" v-if="mod.html" v-html="mod.html" />
          <p v-else class="text-sm text-white/40">{{ mod.description || "—" }}</p>
        </div>
      </div>

      <!-- Renew modal -->
      <UModal v-model:open="showRenew">
        <template #content>
          <div class="p-6">
            <h3 class="mb-4 text-lg font-semibold text-white">{{ t("renewProduct") }}</h3>
            <div v-if="renewInfo" class="space-y-3">
              <div v-for="(cycle, key) in renewInfo.cycles" :key="key">
                <UButton
                  block
                  :variant="renewCycle === key ? 'solid' : 'ghost'"
                  :color="renewCycle === key ? 'primary' : 'neutral'"
                  @click="renewCycle = key"
                  class="justify-between"
                >
                  <span>{{ cycle.name }}</span>
                  <span>{{ cycle.price }}</span>
                </UButton>
              </div>
            </div>
            <div class="mt-5 flex justify-end gap-2">
              <UButton variant="ghost" @click="showRenew = false">{{ t("cancel") }}</UButton>
              <UButton :loading="renewing" @click="doRenew">{{ t("confirmRenew") }}</UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Cancel modal -->
      <UModal v-model:open="showCancel">
        <template #content>
          <div class="p-6">
            <h3 class="mb-4 text-lg font-semibold text-white">{{ t("cancelService") }}</h3>
            <UFormField :label="t('cancelReason')">
              <UTextarea v-model="cancelReason" :placeholder="t('enterCancelReason')" />
            </UFormField>
            <div class="mt-5 flex justify-end gap-2">
              <UButton variant="ghost" @click="showCancel = false">{{ t("cancel") }}</UButton>
              <UButton color="error" :loading="cancelling" @click="doCancel">
                {{ t("confirmCancel") }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const api = useApiClient();
const toast = useToast();
const hostId = route.params.id;

const loading = ref(true);
const error = ref(false);
const detail = ref({});
const modules = ref([]);
const showRenew = ref(false);
const showCancel = ref(false);
const renewInfo = ref(null);
const renewCycle = ref("");
const renewing = ref(false);
const cancelling = ref(false);
const cancelReason = ref("");

const statusClass = (status) => {
  const map = {
    Active: "bg-green-500/15 text-green-400",
    Running: "bg-green-500/15 text-green-400",
    Suspended: "bg-yellow-500/15 text-yellow-400",
    Pending: "bg-blue-500/15 text-blue-400",
    Cancelled: "bg-red-500/15 text-red-400",
    Stopped: "bg-white/10 text-white/50",
  };
  return map[status] || "bg-white/10 text-white/50";
};

const infoFields = computed(() => {
  const d = detail.value;
  return [
    { key: "ip", label: t("ipAddress"), value: d.ip || d.dedicatedip },
    { key: "os", label: t("os"), value: d.os },
    { key: "billingcycle", label: t("billingCycle"), value: d.billingcycle },
    { key: "nextduedate", label: t("nextDue"), value: d.nextduedate },
    { key: "regdate", label: t("createDate"), value: d.regdate },
    { key: "domain", label: t("domain"), value: d.domain },
  ].filter((f) => f.value);
});

const loadDetail = async () => {
  loading.value = true;
  error.value = false;
  try {
    const [detailRes, moduleRes] = await Promise.all([
      api("/products/detail", { query: { id: hostId } }),
      api("/products/module", { query: { id: hostId } }).catch(() => null),
    ]);
    if (detailRes?.success && detailRes.data) {
      detail.value = detailRes.data;
    } else {
      error.value = true;
    }
    if (moduleRes?.success && moduleRes.data) {
      modules.value = Array.isArray(moduleRes.data) ? moduleRes.data : [];
    }
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const toggleAutoRenew = async () => {
  try {
    const res = await api("/products/autorenew", {
      method: "POST",
      body: { id: hostId },
    });
    if (res?.success) {
      detail.value.auto_renew = !detail.value.auto_renew;
      toast.add({ title: res.message || t("success"), color: "success" });
    } else {
      toast.add({ title: res?.message || t("operationFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("operationFailed"), color: "error" });
  }
};

const doRenew = async () => {
  renewing.value = true;
  try {
    const res = await api("/products/renew", {
      method: "POST",
      body: { id: hostId, billingcycle: renewCycle.value },
    });
    if (res?.success) {
      toast.add({ title: res.message || t("renewSuccess"), color: "success" });
      showRenew.value = false;
      await loadDetail();
    } else {
      toast.add({ title: res?.message || t("renewFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("renewFailed"), color: "error" });
  } finally {
    renewing.value = false;
  }
};

const doCancel = async () => {
  cancelling.value = true;
  try {
    const res = await api("/products/cancel", {
      method: "POST",
      body: { id: hostId, reason: cancelReason.value },
    });
    if (res?.success) {
      toast.add({ title: res.message || t("cancelSubmitted"), color: "success" });
      showCancel.value = false;
      await loadDetail();
    } else {
      toast.add({ title: res?.message || t("cancelFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("cancelFailed"), color: "error" });
  } finally {
    cancelling.value = false;
  }
};

onMounted(async () => {
  await loadDetail();
  // Load renew info in background
  try {
    const res = await api("/products/renewpage", { query: { id: hostId } });
    if (res?.success && res.data) renewInfo.value = res.data;
  } catch {
    // non-critical
  }
});
</script>
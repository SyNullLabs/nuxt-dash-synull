<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("apiManagement") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-5">
      <USkeleton class="h-32 w-full rounded-lg" />
    </div>

    <div v-else class="space-y-4">
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-white">{{ t("apiStatus") }}</h3>
            <p class="mt-1 text-xs text-white/40">
              {{ apiEnabled ? t("apiEnabled") : t("apiDisabled") }}
            </p>
          </div>
          <UToggle v-model="apiEnabled" @update:model-value="toggleApi" />
        </div>
      </div>

      <div v-if="apiKey" class="dashboard-panel rounded-2xl p-5">
        <h3 class="mb-3 text-sm font-medium text-white/50">{{ t("apiKey") }}</h3>
        <div class="flex items-center gap-2">
          <code class="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 font-mono">
            {{ showKey ? apiKey : "••••••••••••••••" }}
          </code>
          <UButton variant="ghost" size="sm" @click="showKey = !showKey"
            :icon="showKey ? 'i-solar-eye-closed-bold-duotone' : 'i-solar-eye-bold-duotone'" />
          <UButton variant="soft" color="error" size="sm" @click="resetKey" :loading="resetting">
            {{ t("resetKey") }}
          </UButton>
        </div>
      </div>

      <div class="dashboard-panel rounded-2xl p-5">
        <h3 class="mb-3 text-sm font-medium text-white/50">{{ t("apiLogs") }}</h3>
        <div v-if="logs.length === 0" class="text-sm text-white/40">{{ t("noLogs") }}</div>
        <div v-else class="space-y-2">
          <div v-for="(log, idx) in logs" :key="idx" class="flex items-center justify-between text-sm">
            <span class="text-white/60">{{ log.action || log.path }}</span>
            <span class="text-xs text-white/30">{{ log.create_time || log.date }}</span>
          </div>
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
const apiEnabled = ref(false);
const apiKey = ref("");
const showKey = ref(false);
const resetting = ref(false);
const logs = ref([]);

onMounted(async () => {
  try {
    const [summaryRes, logsRes] = await Promise.all([
      api("/user/api", { query: { action: "summary" } }),
      api("/user/api", { query: { action: "logs" } }),
    ]);
    if (summaryRes?.success && summaryRes.data) {
      apiEnabled.value = !!summaryRes.data.is_open;
      apiKey.value = summaryRes.data.api_key || summaryRes.data.secret || "";
    }
    if (logsRes?.success && logsRes.data) {
      logs.value = Array.isArray(logsRes.data) ? logsRes.data : logsRes.data.list || [];
    }
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
});

const toggleApi = async () => {
  try {
    const res = await api("/user/api", { method: "POST", body: { action: "open" } });
    if (!res?.success) toast.add({ title: res?.message || t("operationFailed"), color: "error" });
  } catch {
    toast.add({ title: t("operationFailed"), color: "error" });
  }
};

const resetKey = async () => {
  resetting.value = true;
  try {
    const res = await api("/user/api", { method: "POST", body: { action: "reset" } });
    if (res?.success) {
      apiKey.value = res.data?.api_key || res.data?.secret || apiKey.value;
      toast.add({ title: t("keyReset"), color: "success" });
    } else {
      toast.add({ title: res?.message || t("operationFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("operationFailed"), color: "error" });
  } finally {
    resetting.value = false;
  }
};
</script>
<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("creditManagement") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-5">
      <USkeleton class="h-32 w-full rounded-lg" />
    </div>

    <div v-else class="space-y-4">
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <p class="text-xs text-white/40">{{ t("creditLimit") }}</p>
            <p class="mt-1 text-xl font-semibold text-white">{{ creditInfo.limit || "—" }}</p>
          </div>
          <div>
            <p class="text-xs text-white/40">{{ t("creditUsed") }}</p>
            <p class="mt-1 text-xl font-semibold text-yellow-400">{{ creditInfo.used || "0" }}</p>
          </div>
          <div>
            <p class="text-xs text-white/40">{{ t("creditAvailable") }}</p>
            <p class="mt-1 text-xl font-semibold text-green-400">{{ creditInfo.available || "—" }}</p>
          </div>
        </div>
      </div>

      <div v-if="records.length" class="dashboard-panel rounded-2xl p-5">
        <h3 class="mb-3 text-sm font-medium text-white/50">{{ t("creditRecords") }}</h3>
        <div class="space-y-2">
          <div v-for="(r, idx) in records" :key="idx" class="flex items-center justify-between text-sm">
            <span class="text-white/60">{{ r.description || r.type }}</span>
            <div class="text-right">
              <span :class="r.amount > 0 ? 'text-green-400' : 'text-red-400'">
                {{ r.amount > 0 ? '+' : '' }}{{ r.amount }}
              </span>
              <span class="ml-2 text-xs text-white/30">{{ r.create_time }}</span>
            </div>
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

const loading = ref(true);
const creditInfo = ref({});
const records = ref([]);

onMounted(async () => {
  try {
    const res = await api("/user/credit");
    if (res?.success && res.data) {
      creditInfo.value = res.data;
      records.value = res.data.list || res.data.records || [];
    }
  } catch {} finally { loading.value = false; }
});
</script>
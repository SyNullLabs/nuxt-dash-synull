<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("operationLogs") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-8 text-center">
      <span class="text-sm text-white/50">{{ t("loading") }}</span>
    </div>

    <div v-else-if="logs.length === 0" class="dashboard-panel rounded-2xl p-8 text-center">
      <Icon name="solar:document-text-bold-duotone" class="mx-auto mb-3 text-4xl text-white/15" />
      <p class="text-sm text-white/45">{{ t("noLogs") }}</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="(log, idx) in logs"
        :key="idx"
        class="dashboard-panel rounded-2xl px-5 py-3"
      >
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-sm text-white">{{ log.description || log.action }}</p>
            <p class="mt-0.5 text-xs text-white/35">
              {{ log.ip || "" }}
              <span v-if="log.create_time" class="ml-2">{{ log.create_time }}</span>
            </p>
          </div>
          <span class="text-xs text-white/30 whitespace-nowrap">{{ log.type || "" }}</span>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="mt-4">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="20"
        :total="totalCount"
        active-color="primary"
        class="dashboard-panel rounded-2xl p-1"
        @update:page="loadLogs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();

const loading = ref(true);
const logs = ref([]);
const currentPage = ref(1);
const totalCount = ref(0);
const totalPages = ref(0);

const loadLogs = async () => {
  loading.value = true;
  try {
    const res = await api("/user/logs", { query: { page: currentPage.value } });
    if (res?.success && res.data) {
      logs.value = res.data.list || res.data.data || [];
      totalCount.value = res.data.total || logs.value.length;
      totalPages.value = Math.ceil(totalCount.value / 20);
    }
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
};

onMounted(loadLogs);
</script>
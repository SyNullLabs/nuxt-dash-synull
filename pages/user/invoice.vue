<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("invoiceManagement") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-8 text-center">
      <span class="text-sm text-white/50">{{ t("loading") }}</span>
    </div>

    <div v-else-if="invoices.length === 0" class="dashboard-panel rounded-2xl p-12 text-center">
      <Icon name="solar:document-text-bold-duotone" class="mx-auto mb-4 text-5xl text-white/15" />
      <p class="text-white/45">{{ t("noInvoices") }}</p>
    </div>

    <div v-else class="space-y-2">
      <div v-for="inv in invoices" :key="inv.id" class="dashboard-panel rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-white">{{ inv.title || inv.name || `#${inv.id}` }}</p>
            <p class="mt-0.5 text-xs text-white/40">
              {{ inv.amount }} · {{ inv.status_text || inv.status }} · {{ inv.create_time }}
            </p>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-xs"
            :class="inv.status === 'paid' || inv.status === 1 ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'"
          >
            {{ inv.status_text || inv.status }}
          </span>
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
const invoices = ref([]);

onMounted(async () => {
  try {
    const res = await api("/user/invoice");
    if (res?.success && res.data) {
      invoices.value = Array.isArray(res.data) ? res.data : res.data.list || [];
    }
  } catch {} finally { loading.value = false; }
});
</script>
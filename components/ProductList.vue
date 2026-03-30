<template>
  <div>
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2">
        <USelectMenu
          v-if="!loading"
          v-model="selectedStatus"
          :items="statusOptions"
          label-key="label"
          value-key="value"
          :placeholder="$t('selectStatus')"
          class="w-full sm:w-48"
          multiple
        />
      </div>
      <UInput
        v-model="searchQuery"
        :placeholder="$t('searchProducts')"
        icon="i-solar-minimalistic-magnifer-bold-duotone"
        class="w-full sm:w-64"
      />
    </div>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-8 text-center">
      <span class="text-sm text-white/50">{{ $t("loading") }}</span>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="dashboard-panel rounded-2xl p-8 text-center">
      <Icon name="solar:box-bold-duotone" class="mx-auto mb-3 text-4xl text-white/15" />
      <span class="text-sm text-white/50">{{ $t("noAvailableOptions") }}</span>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="item in paginatedProducts"
        :key="item.id"
        @click="navigateTo(`/products/${item.id}`)"
        class="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-all duration-200 hover:border-white/14 hover:bg-white/[0.05]"
      >
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-white">
                {{ item.productName || item.name }}
              </span>
              <span
                class="rounded-full px-2 py-0.5 text-xs"
                :class="statusClass(item.domainstatus || item.status)"
              >
                {{ $t(item.domainstatus || item.status || "unknown") }}
              </span>
            </div>
            <p class="mt-1 text-xs text-white/40">
              {{ item.domain || item.dedicatedip || item.ip || "" }}
              <span v-if="item.nextduedate" class="ml-2">
                {{ $t("nextDue") }}: {{ item.nextduedate }}
              </span>
            </p>
          </div>
          <Icon
            name="solar:arrow-right-outline"
            class="text-white/20 transition-colors group-hover:text-white/50"
          />
        </div>
      </div>
    </div>

    <div v-if="filteredProducts.length > pageSize" class="mt-4">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="pageSize"
        :total="filteredProducts.length"
        active-color="primary"
        class="dashboard-panel rounded-2xl p-1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  type: { type: String, default: "" },
  title: { type: String, default: "" },
});

const { t } = useI18n();
const api = useApiClient();

const loading = ref(true);
const products = ref([]);
const searchQuery = ref("");
const selectedStatus = ref([]);
const currentPage = ref(1);
const pageSize = 10;

const statusOptions = [
  { label: t("Pending"), value: "Pending" },
  { label: t("Active"), value: "Active" },
  { label: t("Cancelled"), value: "Cancelled" },
  { label: t("Suspended"), value: "Suspended" },
  { label: t("Deleted"), value: "Deleted" },
];

const statusClass = (status) => {
  const map = {
    Active: "bg-green-500/15 text-green-400",
    Running: "bg-green-500/15 text-green-400",
    Suspended: "bg-yellow-500/15 text-yellow-400",
    Pending: "bg-blue-500/15 text-blue-400",
    Cancelled: "bg-red-500/15 text-red-400",
    Stopped: "bg-white/10 text-white/50",
    Deleted: "bg-white/10 text-white/50",
  };
  return map[status] || "bg-white/10 text-white/50";
};

const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const statuses = selectedStatus.value || [];
  return products.value.filter((p) => {
    const name = (p.productName || p.name || "").toLowerCase();
    const domain = (p.domain || "").toLowerCase();
    const ip = (p.dedicatedip || p.ip || "").toLowerCase();
    const matchesQuery = !query || name.includes(query) || domain.includes(query) || ip.includes(query);
    const matchesStatus = !statuses.length || statuses.includes(p.domainstatus || p.status);
    return matchesQuery && matchesStatus;
  });
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1;
});

onMounted(async () => {
  try {
    const query = props.type ? { groupid: props.type } : {};
    const res = await api("/products/hosts", { query });
    if (res?.success && res.data) {
      const data = res.data.data || res.data;
      if (data.list) {
        products.value = Array.isArray(data.list) ? data.list : [];
      } else if (Array.isArray(data)) {
        products.value = data;
      }
    }
  } catch (e) {
    console.error("Failed to load products:", e);
  } finally {
    loading.value = false;
  }
});
</script>
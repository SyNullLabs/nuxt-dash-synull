<template>
  <div class="mb-4">
    <nav class="m-0 flex flex-row items-center gap-1 text-sm text-white/45">
      <router-link :to="home.route" class="flex flex-row items-center">
        <Icon :name="home.icon" :class="home.class" />
      </router-link>
      <Icon
        name="solar:alt-arrow-right-outline"
        class="text-gray-500 text-lg"
      />
      <span
        v-for="(item, index) in items"
        :key="index"
        class="flex flex-row items-center gap-1"
      >
        <span :class="item.class">{{ item.label }}</span>
        <Icon
          v-if="index < items.length - 1"
          name="solar:alt-arrow-right-outline"
          class="ml text-lg text-white/35"
        />
      </span>
    </nav>
  </div>
  <div class="mb-4 flex flex-row justify-between">
    <div class="w-full pr-2">
      <USelectMenu
        v-if="!loading"
        v-model="selectedStatus"
        :items="selectStatus"
        label-key="label"
        value-key="value"
        :search-input="{ placeholder: t('searchProducts') }"
        :placeholder="$t('selectStatus')"
        class="w-full md:w-80"
        multiple
      />
    </div>
    <div class="relative">
      <span
        class="absolute inset-y-0 left-0 flex items-center rounded-l-lg p-2.5"
      >
        <Icon
          name="solar:minimalistic-magnifer-bold-duotone"
          class="text-synull h-5 w-5"
        />
      </span>
      <input
        v-model="searchQuery"
        class="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm leading-tight text-white placeholder:text-white/30 focus:border-synull/40 focus:outline-none focus:ring-2 focus:ring-synull/20"
        :placeholder="t('searchProducts')"
      />
    </div>
  </div>
  <div
    v-if="!loading && paginatedProducts.length > 0"
    class="dashboard-panel mb-4 overflow-hidden rounded-[1.75rem]"
  >
    <div class="flex flex-col gap-1 rounded-xl p-1">
      <div v-for="item in paginatedProducts" :key="item.id || item.domain">
        <div>
          <div
            class="flex w-full flex-col gap-2 rounded-[1.35rem] border border-white/10 bg-white/5 p-2 transition-colors duration-300 hover:bg-white/7 sm:flex-row sm:items-center"
          >
            <div
              class="flex w-full flex-1 flex-col justify-between gap-2 p-2 md:flex-row md:items-center"
            >
              <div class="flex flex-col whitespace-nowrap">
                <span
                  class="flex items-center text-sm font-medium text-synull-100"
                >
                  <Icon
                    name="solar:bolt-circle-bold-duotone"
                    class="mr-1 text-lg text-white/35"
                  >
                  </Icon
                  >{{ item.domain }}
                </span>
                <div
                  class="mt-1 whitespace-nowrap text-lg font-medium text-white"
                >
                  {{ item.productName }}
                  <span
                    class="rounded-full border px-2 py-1 text-xs select-none"
                    :class="resolveStatusColor(item.domainstatus).class"
                  >
                    {{ $t(item.domainstatus) }}
                  </span>
                </div>
              </div>
              <div class="flex max-w-5xl grow flex-wrap justify-center">
                <div class="relative w-1/2 sm:w-1/4">
                  <client-only>
                    <LineChart
                      :option="chartDataFor(item.id, 'cpu')"
                      class="h-14 w-full"
                    />
                  </client-only>
                  <span
                    class="pointer-events-none absolute inset-x-0 top-1 z-0 flex items-center justify-center whitespace-nowrap text-xl font-black text-emerald-300/18 select-none"
                  >
                    {{ $t("CPU Usage") }}
                  </span>
                </div>
                <div class="relative w-1/2 sm:w-1/4">
                  <client-only>
                    <LineChart
                      :option="chartDataFor(item.id, 'memory')"
                      class="h-14 w-full"
                    />
                  </client-only>
                  <span
                    class="pointer-events-none absolute inset-x-0 top-1 z-0 flex items-center justify-center whitespace-nowrap text-xl font-black text-sky-300/18 select-none"
                  >
                    {{ $t("Memory Usage") }}
                  </span>
                </div>
                <div class="relative w-1/2 sm:w-1/4">
                  <client-only>
                    <LineChart
                      :option="chartDataFor(item.id, 'disk')"
                      class="h-14 w-full"
                    />
                  </client-only>
                  <span
                    class="pointer-events-none absolute inset-x-0 top-1 z-0 flex items-center justify-center whitespace-nowrap text-xl font-black text-synull-200/20 select-none"
                  >
                    {{ $t("Disk Usage") }}
                  </span>
                </div>
                <div class="relative w-1/2 sm:w-1/4">
                  <client-only>
                    <LineChart
                      :option="chartDataFor(item.id, 'network')"
                      class="h-14 w-full"
                    />
                  </client-only>
                  <span
                    class="pointer-events-none absolute inset-x-0 top-1 z-0 flex items-center justify-center whitespace-nowrap text-xl font-black text-amber-300/18 select-none"
                  >
                    {{ $t("Network Usage") }}
                  </span>
                </div>
              </div>
              <div
                class="flex flex-row items-center gap-2 text-2xl text-white/42"
              >
                <NuxtLink
                  :to="`/products/${item.id}`"
                  class="transition-colors hover:text-white"
                >
                  <Icon
                    name="solar:info-circle-line-duotone"
                    :label="$t('info')"
                  />
                </NuxtLink>
                <Icon
                  name="solar:power-bold-duotone"
                  :label="$t('power')"
                  class="opacity-60"
                />
                <Icon
                  name="solar:link-minimalistic-2-bold-duotone"
                  :label="$t('VNC')"
                  class="opacity-60"
                />
                <NuxtLink
                  :to="`/products/${item.id}`"
                  class="transition-colors hover:text-white"
                >
                  <Icon name="solar:eye-bold-duotone" :label="$t('view')" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else-if="!loading"
    class="dashboard-panel mb-4 flex items-center justify-center rounded-[1.75rem] py-8 text-white/55"
  >
    <span class="text-sm"
      ><i>{{ $t("noAvailableOptions") }}</i></span
    >
  </div>
  <div
    v-else
    class="dashboard-panel mb-4 flex items-center justify-center rounded-[1.75rem] py-8 text-white/55"
  >
    <span class="text-sm"
      ><i>{{ $t("loading") }}</i></span
    >
  </div>
  <div class="flex flex-row justify-between">
    <div>
      <UPagination
        v-if="!loading"
        v-model:page="first"
        :items-per-page="5"
        :total="filteredProducts.length"
        active-color="primary"
        show-edges
        class="dashboard-panel mb-4 rounded-2xl p-1"
      />
    </div>
  </div>
</template>

<script setup>
import { useToast } from "#imports";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useProductsListStore } from "@/stores/products/list";

const { t } = useI18n();
const toast = useToast();
const api = useApiClient();
const loading = ref(true);
const productsStore = useProductsListStore();
const products = ref([]);
const chartDataByProduct = ref({});
const chartLoadingByProduct = ref({});

const chartMetricDefinitions = {
  cpu: {
    color: "#10B981",
    labelKey: "CPU Usage",
    aliases: ["cpu", "cpu_usage", "cpuuse", "cpu_data"],
  },
  memory: {
    color: "#3B82F6",
    labelKey: "Memory Usage",
    aliases: ["memory", "memory_usage", "memoryuse", "mem", "ram"],
  },
  disk: {
    color: "#8B5CF6",
    labelKey: "Disk Usage",
    aliases: ["disk", "disk_usage", "diskuse", "storage"],
  },
  network: {
    color: "#F59E0B",
    labelKey: "Network Usage",
    aliases: [
      "network",
      "network_usage",
      "networkuse",
      "net",
      "bandwidth",
    ],
  },
};

const buildChartDataset = (definition, labels = [], values = [], unit = "") => ({
  animation: false,
  grid: { top: 5, right: 5, bottom: 5, left: 5 },
  xAxis: { type: "category", data: labels, show: false, boundaryGap: false },
  yAxis: { type: "value", show: false, min: 0 },
  series: [
    {
      name: unit
        ? `${t(definition.labelKey)} (${unit})`
        : t(definition.labelKey),
      type: "line",
      data: values,
      smooth: true,
      lineStyle: { color: definition.color, width: 2 },
      areaStyle: { color: definition.color, opacity: 0.12 },
      symbol: "none",
    },
  ],
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "line",
      lineStyle: { color: "rgba(255,255,255,0.2)" },
    },
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "#eee",
    textStyle: { color: "#333", fontSize: 12 },
  },
});

const createEmptyChartSet = () =>
  Object.fromEntries(
    Object.entries(chartMetricDefinitions).map(([key, definition]) => [
      key,
      buildChartDataset(definition),
    ])
  );

const emptyCharts = computed(() => createEmptyChartSet());

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toFiniteNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const pickChartList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.list)) {
    return payload.list;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.series)) {
    return payload.series;
  }

  const directEntries = Object.entries(payload)
    .filter(
      ([key]) =>
        !["unit", "label", "chart_type", "title", "name"].includes(
          key.toLowerCase()
        )
    )
    .map(([label, value]) => {
      const numericValue = toFiniteNumber(value);
      return numericValue === null ? null : { label, value: numericValue };
    })
    .filter(Boolean);

  return directEntries.length ? directEntries : [];
};

const normalizeChartPoint = (point, index) => {
  if (Array.isArray(point)) {
    const numericValue = toFiniteNumber(point[1] ?? point[0]);

    if (numericValue === null) {
      return null;
    }

    return {
      label: `${point[0] ?? index + 1}`,
      value: numericValue,
    };
  }

  const directNumber = toFiniteNumber(point);

  if (directNumber !== null) {
    return {
      label: `${index + 1}`,
      value: directNumber,
    };
  }

  if (!isRecord(point)) {
    return null;
  }

  const numericValue =
    [
      point.value,
      point.usage,
      point.percent,
      point.y,
      point.data,
      point.num,
      point.total,
    ]
      .map((value) => toFiniteNumber(value))
      .find((value) => value !== null) ?? null;

  if (numericValue === null) {
    return null;
  }

  return {
    label:
      point.time ||
      point.label ||
      point.name ||
      point.date ||
      point.x ||
      `${index + 1}`,
    value: numericValue,
  };
};

const findMetricPayload = (source, aliases) => {
  if (!isRecord(source)) {
    return null;
  }

  const entries = Object.entries(source);

  for (const alias of aliases) {
    if (source[alias] !== undefined && source[alias] !== null) {
      return source[alias];
    }

    const matchedEntry = entries.find(
      ([key]) => key.toLowerCase() === alias.toLowerCase()
    );

    if (matchedEntry) {
      return matchedEntry[1];
    }
  }

  return null;
};

const normalizeMetricChart = (definition, payload) => {
  const points = pickChartList(payload)
    .map((point, index) => normalizeChartPoint(point, index))
    .filter(Boolean);
  const unit =
    isRecord(payload) && typeof payload.unit === "string" ? payload.unit : "";

  return buildChartDataset(
    definition,
    points.map((point) => point.label),
    points.map((point) => point.value),
    unit
  );
};

const normalizeProductCharts = (data) => {
  const source = isRecord(data?.data) ? data.data : data;
  const charts = createEmptyChartSet();

  Object.entries(chartMetricDefinitions).forEach(([metricKey, definition]) => {
    const payload = findMetricPayload(source, definition.aliases);

    if (payload !== null) {
      charts[metricKey] = normalizeMetricChart(definition, payload);
    }
  });

  return charts;
};

const buildChartQuery = (product) =>
  Object.fromEntries(
    Object.entries({
      host_id: product.id,
      api_type: product.apiType,
      domainstatus: product.domainstatus,
      type: product.type,
      zjmf_api_id: product.zjmfApiId,
      dcimid: product.dcimid,
    }).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

const chartDataFor = (productId, metricKey) =>
  chartDataByProduct.value[productId]?.[metricKey] ||
  emptyCharts.value[metricKey];

const loadChartsForProducts = async (items = []) => {
  const pendingProducts = items.filter(
    (item) =>
      item?.id &&
      !chartDataByProduct.value[item.id] &&
      !chartLoadingByProduct.value[item.id]
  );

  if (!pendingProducts.length) {
    return;
  }

  chartLoadingByProduct.value = {
    ...chartLoadingByProduct.value,
    ...Object.fromEntries(pendingProducts.map((item) => [item.id, true])),
  };

  const results = await Promise.allSettled(
    pendingProducts.map((item) =>
      api("/products/chart", {
        method: "GET",
        query: buildChartQuery(item),
      })
    )
  );

  const nextCharts = { ...chartDataByProduct.value };
  const nextLoading = { ...chartLoadingByProduct.value };
  let hasFailedCharts = false;

  results.forEach((result, index) => {
    const product = pendingProducts[index];
    nextLoading[product.id] = false;

    if (result.status === "fulfilled" && result.value?.success) {
      nextCharts[product.id] = normalizeProductCharts(result.value.data);
      return;
    }

    nextCharts[product.id] = createEmptyChartSet();
    hasFailedCharts = true;
    console.error("获取产品图表失败", product.id, result);
  });

  chartDataByProduct.value = nextCharts;
  chartLoadingByProduct.value = nextLoading;

  if (hasFailedCharts) {
    toast.add({
      title: t("chartLoadFailed"),
      color: "error",
    });
  }
};

onMounted(async () => {
  try {
    await productsStore.fetchProductsList();
    products.value = productsStore.parseProductsToArray();
    await loadChartsForProducts(paginatedProducts.value);
  } catch (error) {
    console.error("获取产品列表时出错:", error);
  } finally {
    loading.value = false;
  }
});

const home = ref({
  icon: "solar:home-2-bold-duotone",
  route: "/",
  class: "text-synull text-xl",
});
const items = ref([
  { label: t("productManagement"), class: "text-white/45" },
  { label: t("cloudVirtualMachine"), class: "text-white/45" },
]);

const searchQuery = ref("");

const filteredProducts = computed(() => {
  if (!Array.isArray(products.value)) {
    console.warn("products.value 不是数组:", products.value);
    return [];
  }

  const query = searchQuery.value.toLowerCase();
  const selectedStatuses = selectedStatus.value || [];

  return products.value.filter((product) => {
    const matchesQuery =
      (product.productName || "").toLowerCase().includes(query) ||
      (product.domain || "").toLowerCase().includes(query) ||
      (product.dedicatedip || "").toLowerCase().includes(query);

    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.some((status) => product.domainstatus === status);

    return matchesQuery && matchesStatus;
  });
});

const first = ref(1);
const selectedStatus = ref([]);

const paginatedProducts = computed(() => {
  const pageSize = 5;
  const start = (first.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredProducts.value.slice(start, end);
});

watch([searchQuery, selectedStatus], () => {
  first.value = 1;
});

watch(
  paginatedProducts,
  (items) => {
    void loadChartsForProducts(items);
  },
  { deep: false }
);

const selectStatus = ref([
  { label: t("Pending"), value: "Pending" },
  { label: t("Active"), value: "Active" },
  { label: t("Cancelled"), value: "Cancelled" },
  { label: t("Fraud"), value: "Fraud" },
  { label: t("Deleted"), value: "Deleted" },
  { label: t("Suspended"), value: "Suspended" },
]);

const statusColors = {
  Pending: {
    name: "待开通",
    class: "bg-orange-100 border-orange-200/80 text-orange-500",
  },
  Active: {
    name: "已激活",
    class: "bg-green-100 border-green-200/80 text-green-500",
  },
  Cancelled: {
    name: "被取消",
    class: "bg-gray-100 border-gray-200/80 text-gray-500",
  },
  Fraud: {
    name: "有欺诈",
    class: "bg-red-100 border-red-200/80 text-red-500",
  },
  Deleted: {
    name: "被删除",
    class: "bg-zinc-100 border-zinc-200/80 text-zinc-500",
  },
  Suspended: {
    name: "已暂停",
    class: "bg-yellow-100 border-yellow-200/80 text-yellow-500",
  },
};

const resolveStatusColor = (status) =>
  statusColors[status] || {
    name: status || "unknown",
    class: "bg-zinc-100 border-zinc-200/80 text-zinc-500",
  };
</script>

<template>
  <div class="mx-auto grid w-full max-w-272 gap-6 md:gap-10">
    <div class="flex flex-wrap items-center justify-end gap-3">
      <UBadge v-if="defaultCurrencyLabel" color="neutral" variant="subtle"
        class="rounded-[0.45rem] px-4 py-2 text-[0.82rem] font-semibold tracking-[0.08em]">
        {{ defaultCurrencyLabel }}
      </UBadge>

      <UButton v-if="canUseMockCatalog" color="neutral" variant="soft" icon="i-solar-test-tube-bold-duotone"
        :label="useMockCatalog ? 'Mock 已开启' : '切换 Mock'"
        class="motion-reduce:transform-none motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:active:scale-[0.98]"
        @click="toggleMockCatalog" />

      <UButton to="/cart" variant="soft" color="neutral" icon="i-solar-cart-large-bold-duotone" :label="t('viewCart')"
        class="motion-reduce:transform-none motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:active:scale-[0.98]" />
    </div>

    <div v-if="loading" class="grid gap-10">
      <SynullLoadingBars label="Loading catalog" />

      <section class="grid gap-4">
        <USkeleton class="h-3 w-28 rounded-full" />
        <div class="flex flex-wrap gap-2">
          <USkeleton v-for="item in 3" :key="`type-${item}`" class="h-11 w-36 rounded-md" />
        </div>
      </section>

      <section class="grid gap-4">
        <USkeleton class="h-3 w-32 rounded-full" />
        <div class="flex flex-wrap gap-3">
          <USkeleton v-for="item in 4" :key="`group-${item}`" class="h-24 w-full max-w-[20rem] rounded-lg" />
        </div>
      </section>

      <section class="grid gap-4">
        <USkeleton class="h-3 w-36 rounded-full" />
        <div class="flex flex-wrap gap-5">
          <USkeleton v-for="item in 3" :key="`plan-${item}`" class="h-72 w-full max-w-[20rem] rounded-lg" />
        </div>
      </section>
    </div>

    <UCard v-else-if="error" class="min-h-56"
      :ui="{ root: 'rounded-[0.55rem]', body: 'grid place-items-center gap-3 p-8 text-center' }">
      <Icon name="solar:danger-triangle-bold-duotone" class="text-[2.2rem] text-synull" />
      <p class="m-0 text-muted">{{ t("loadProductsFailed") }}</p>
      <UButton @click="loadProducts" variant="soft" :label="t('retry')" />
    </UCard>

    <div v-else class="grid gap-10">
      <section class="grid gap-4" :class="getSectionMotionClass(0)">
        <span class="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-dimmed">
          01 PRODUCT LINE
        </span>

        <div class="flex justify-start">
          <UTabs v-model="activeFirstTab" :items="firstGroupTabItems" :content="false" size="xl"
            class="w-auto max-w-full" :ui="{
              list: 'relative inline-flex w-auto max-w-full items-center gap-5 bg-0',
              indicator:
                'shadow-[0_0_0_1.725px_rgba(124,58,237,0.3)] shadow-violet-500/30 bg-inherit',
              trigger:
                'min-w-fitfont-semibold transition-colors duration-200 data-[state=inactive]:text-[var(--ui-text-muted)] data-[state=inactive]:hover:text-[var(--ui-text)] data-[state=active]:text-[var(--ui-text)]',
              leadingIcon: 'text-sm',
            }" />
        </div>
      </section>

      <section v-if="hasCategoryGroups" class="grid gap-4" :class="getSectionMotionClass(1)">
        <span class="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-dimmed">
          02 PRODUCT GROUP
        </span>

        <Transition
          enter-active-class="motion-reduce:transition-none motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
          enter-from-class="motion-reduce:transform-none opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="motion-reduce:transition-none motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.4,0,1,1)]"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="motion-reduce:transform-none opacity-0 -translate-y-2" mode="out-in">
          <div :key="String(activeFirstGroupId)" class="flex flex-wrap gap-3">
            <UCard v-for="group in allGroups" :key="group.id" as="button" type="button" variant="outline"
              class="relative w-full max-w-56 overflow-hidden text-left motion-reduce:transform-none motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
              :class="String(activeGroupId) === String(group.id) ? 'ring-1 ring-inset ring-violet-500/20' : ''"
              :ui="{ root: 'rounded-[0.45rem] cursor-pointer', body: 'p-4 min-h-[5.1rem] flex flex-col justify-center gap-3' }"
              @click="selectProductGroup(group.id)">
              <span class="absolute inset-y-0 left-0 w-0.75" :class="String(activeGroupId) === String(group.id)
                ? 'bg-linear-to-b from-synull-400 to-violet-600'
                : 'bg-transparent'
                "></span>

              <div class="flex items-center gap-3 text-default">
                <Icon v-if="group.icon" :name="group.icon" class="shrink-0 text-base text-dimmed" />
                <span class="text-[0.98rem] font-semibold">{{
                  group.name
                }}</span>
              </div>
            </UCard>
          </div>
        </Transition>
      </section>

      <section class="grid gap-4" :class="getSectionMotionClass(2)">
        <span class="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-dimmed">
          03 AVAILABLE PLANS
        </span>

        <Transition
          enter-active-class="motion-reduce:transition-none motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
          enter-from-class="motion-reduce:transform-none opacity-0 translate-y-3"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="motion-reduce:transition-none motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.4,0,1,1)]"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="motion-reduce:transform-none opacity-0 -translate-y-2" mode="out-in">
          <div :key="`${activeFirstGroupId}-${activeGroupId}-${visibleProducts.length}`">
            <div v-if="visibleProducts.length" class="flex flex-wrap gap-5">
              <UCard v-for="(product, index) in visibleProducts" :key="product.id" variant="outline"
                class="flex min-h-full w-full max-w-[20rem] flex-col" :ui="{
                  root: 'rounded-[0.55rem]',
                  header: 'p-6',
                  body: 'flex-1 grid gap-3 p-6',
                  footer: 'bg-[var(--ui-bg)]/50 p-0 sm:p-0',
                }">
                <template #header>
                  <div class="mb-3 h-0.75 w-3.5 rounded-full" :class="index % 3 === 0
                    ? 'bg-synull'
                    : index % 3 === 1
                      ? 'bg-violet-500'
                      : 'bg-violet-500'
                    "></div>

                  <p class="m-0 text-[0.82rem] text-muted">
                    {{ activeSecondaryLabel || activePrimaryLabel || "SYNULL" }}
                  </p>

                  <h2 class="mt-2 text-[1.05rem] font-semibold text-default">
                    {{ product.name }}
                  </h2>

                  <p v-if="product.price_text"
                    class="mt-2 text-[clamp(1.55rem,2vw,2rem)] font-semibold tracking-[-0.04em] text-default">
                    {{ product.price_text }}
                  </p>

                  <p v-else class="mt-2 text-[0.88rem] font-semibold text-muted">
                    {{ t("configureProduct") }}
                  </p>
                </template>

                <div v-for="(spec, specIndex) in getProductSpecs(product)" :key="`${product.id}-${spec}-${specIndex}`"
                  class="flex items-center justify-between gap-4">
                  <span class="text-[0.78rem] font-semibold text-dimmed">
                    {{ formatSpecLabel(specIndex) }}
                  </span>
                  <span class="text-right font-mono text-[0.84rem] font-semibold text-default">
                    {{ spec }}
                  </span>
                </div>

                <template #footer>
                  <UButton block type="button" size="md" :class="[
                    'rounded-none py-3 text-[0.85rem] font-bold motion-reduce:transform-none motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:opacity-95 motion-safe:active:opacity-80',
                    index % 3 === 0
                      ? 'bg-violet-600'
                      : index % 3 === 1
                        ? 'bg-synull-600'
                        : 'bg-purple-700'
                  ]" color="neutral" variant="solid" :disabled="useMockCatalog" @click="openProduct(product.id)">
                    {{ useMockCatalog ? "Mock 预览" : t("buyNow") }}
                  </UButton>
                </template>
              </UCard>
            </div>

            <UEmpty v-else icon="solar:box-bold-duotone" :description="t('noProducts')"
              :ui="{ root: 'min-h-[14rem] rounded-[0.55rem] border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]' }" />
          </div>
        </Transition>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { parseBuyCatalogGroupName } from "~/utils/buy-catalog";

const { t } = useI18n();
const api = useApiClient();

const loading = ref(true);
const error = ref(false);
const firstGroups = ref([]);
const activeFirstGroupId = ref(null);
const allGroups = ref([]);
const activeGroupId = ref(null);
const defaultCurrency = ref(null);
const canUseMockCatalog = import.meta.dev;
const useMockCatalog = ref(false);
const pageReady = ref(false);

const mockCatalog = {
  default_currency: {
    code: "CNY",
  },
  first_groups: [
    { id: 101, name: "标准算力" },
    { id: 102, name: "内存优化" },
    { id: 103, name: "计算优化" },
  ],
  product_groups: {
    101: [
      { id: 1001, name: "东京 JP / 42ms" },
      { id: 1002, name: "新加坡 SG / 68ms" },
      { id: 1003, name: "洛杉矶 US / 112ms" },
    ],
    102: [
      { id: 2001, name: "东京 JP / 44ms" },
      { id: 2002, name: "法兰克福 DE / 184ms" },
      { id: 2003, name: "香港 CN / 12ms" },
    ],
    103: [
      { id: 3001, name: "新加坡 SG / 65ms" },
      { id: 3002, name: "东京 JP / 39ms" },
      { id: 3003, name: "伦敦 UK / 210ms" },
    ],
  },
  products: {
    1001: [
      {
        id: "mock-standard-tokyo-entry",
        name: "Entry Tier",
        description: "1 vCPU\n2 GB 内存\n50 GB NVMe\n1 TB 月流量",
        price_text: "¥36 / 月",
      },
      {
        id: "mock-standard-tokyo-pro",
        name: "Pro Tier",
        description: "2 vCPU\n4 GB 内存\n100 GB NVMe\n2 TB 月流量",
        price_text: "¥88 / 月",
      },
      {
        id: "mock-standard-tokyo-elite",
        name: "Enterprise Tier",
        description: "4 vCPU\n8 GB 内存\n200 GB NVMe\n5 TB 月流量",
        price_text: "¥168 / 月",
      },
    ],
    1002: [
      {
        id: "mock-standard-singapore-entry",
        name: "Edge Lite",
        description: "1 vCPU\n2 GB 内存\n40 GB NVMe\n1 TB 月流量",
        price_text: "¥42 / 月",
      },
      {
        id: "mock-standard-singapore-pro",
        name: "Edge Pro",
        description: "2 vCPU\n6 GB 内存\n120 GB NVMe\n2 TB 月流量",
        price_text: "¥96 / 月",
      },
    ],
    1003: [
      {
        id: "mock-standard-la-entry",
        name: "West Starter",
        description: "2 vCPU\n4 GB 内存\n80 GB NVMe\n2 TB 月流量",
        price_text: "¥79 / 月",
      },
      {
        id: "mock-standard-la-pro",
        name: "West Business",
        description: "4 vCPU\n8 GB 内存\n160 GB NVMe\n4 TB 月流量",
        price_text: "¥149 / 月",
      },
    ],
    2001: [
      {
        id: "mock-memory-tokyo-memory",
        name: "Memory M4",
        description: "2 vCPU\n8 GB 内存\n120 GB NVMe\n2 TB 月流量",
        price_text: "¥109 / 月",
      },
      {
        id: "mock-memory-tokyo-memory-plus",
        name: "Memory M8",
        description: "4 vCPU\n16 GB 内存\n240 GB NVMe\n4 TB 月流量",
        price_text: "¥199 / 月",
      },
    ],
    2002: [
      {
        id: "mock-memory-frankfurt-cache",
        name: "Cache Heavy",
        description: "4 vCPU\n24 GB 内存\n240 GB NVMe\n5 TB 月流量",
        price_text: "¥229 / 月",
      },
      {
        id: "mock-memory-frankfurt-db",
        name: "DB Prime",
        description: "8 vCPU\n32 GB 内存\n400 GB NVMe\n8 TB 月流量",
        price_text: "¥389 / 月",
      },
    ],
    2003: [
      {
        id: "mock-memory-hk-fast",
        name: "HK Low Latency",
        description: "2 vCPU\n8 GB 内存\n100 GB NVMe\n2 TB 月流量",
        price_text: "¥126 / 月",
      },
    ],
    3001: [
      {
        id: "mock-cpu-singapore-c2",
        name: "CPU C2",
        description: "4 vCPU\n4 GB 内存\n120 GB NVMe\n3 TB 月流量",
        price_text: "¥119 / 月",
      },
      {
        id: "mock-cpu-singapore-c4",
        name: "CPU C4",
        description: "8 vCPU\n8 GB 内存\n200 GB NVMe\n5 TB 月流量",
        price_text: "¥218 / 月",
      },
    ],
    3002: [
      {
        id: "mock-cpu-tokyo-render",
        name: "Render Sprint",
        description: "6 vCPU\n8 GB 内存\n160 GB NVMe\n4 TB 月流量",
        price_text: "¥178 / 月",
      },
      {
        id: "mock-cpu-tokyo-burst",
        name: "Burst Peak",
        description: "10 vCPU\n12 GB 内存\n240 GB NVMe\n6 TB 月流量",
        price_text: "¥269 / 月",
      },
    ],
    3003: [
      {
        id: "mock-cpu-london-compile",
        name: "Compile XL",
        description: "8 vCPU\n16 GB 内存\n240 GB NVMe\n6 TB 月流量",
        price_text: "¥288 / 月",
      },
    ],
  },
};

const hasCategoryGroups = computed(() =>
  allGroups.value.some((group) => Boolean(group.name))
);

const visibleGroups = computed(() => {
  if (activeGroupId.value === null) {
    return allGroups.value.filter((group) => group.items.length > 0);
  }

  return allGroups.value.filter(
    (group) =>
      String(group.id) === String(activeGroupId.value) && group.items.length > 0
  );
});

const visibleProducts = computed(() =>
  visibleGroups.value.flatMap((group) => group.items)
);

const activePrimaryLabel = computed(
  () =>
    firstGroups.value.find(
      (group) => String(group.id) === String(activeFirstGroupId.value)
    )?.name || ""
);

const activeSecondaryLabel = computed(
  () =>
    allGroups.value.find(
      (group) => String(group.id) === String(activeGroupId.value)
    )?.name || ""
);

const defaultCurrencyLabel = computed(() => {
  if (!defaultCurrency.value) {
    return "";
  }

  return (
    defaultCurrency.value.code ||
    [defaultCurrency.value.prefix, defaultCurrency.value.suffix]
      .filter(Boolean)
      .join(" ")
  );
});

const firstGroupTabItems = computed(() =>
  firstGroups.value.map((group) => ({
    label: group.name,
    icon: group.icon,
    value: String(group.id),
  }))
);

const activeFirstTab = computed({
  get: () => String(activeFirstGroupId.value ?? ""),
  set: (value) => {
    if (value) {
      selectFirstGroup(value);
    }
  },
});

const setGroups = (groups, products = [], selectedGroupId = null) => {
  const fallbackGroupId = groups[0]?.id ?? null;
  const resolvedGroupId = selectedGroupId ?? fallbackGroupId;

  activeGroupId.value = resolvedGroupId;
  allGroups.value = groups.map((group) => ({
    ...group,
    items: String(group.id) === String(resolvedGroupId) ? products : [],
  }));
};

const createMockCatalogResponse = (query = {}) => {
  const firstGroups = mockCatalog.first_groups;
  const resolvedFirstGroupId = Number(
    query.first_gid ?? firstGroups[0]?.id ?? null
  );
  const productGroups = mockCatalog.product_groups[resolvedFirstGroupId] || [];
  const resolvedGroupId = Number(query.gid ?? productGroups[0]?.id ?? null);

  return {
    success: true,
    data: {
      first_groups: firstGroups,
      product_groups: productGroups,
      products: mockCatalog.products[resolvedGroupId] || [],
      default_currency: mockCatalog.default_currency,
    },
  };
};

const revealContent = () => {
  requestAnimationFrame(() => {
    pageReady.value = true;
  });
};

const getSectionMotionClass = (index = 0) => {
  const delays = [
    "motion-safe:delay-75",
    "motion-safe:delay-150",
    "motion-safe:delay-200",
  ];

  return [
    "motion-reduce:transform-none motion-reduce:transition-none motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
    pageReady.value ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
    delays[index] || delays[0],
  ];
};

const toggleMockCatalog = async () => {
  useMockCatalog.value = !useMockCatalog.value;
  await loadProducts();
};

const openProduct = (productId) => {
  if (useMockCatalog.value) {
    return;
  }

  navigateTo(`/buy/${productId}`);
};

const getProductSpecs = (product) => {
  const specs = (product?.description || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return specs.length ? specs : [t("configureProduct")];
};

const formatSpecLabel = (index) => `ITEM ${String(index + 1).padStart(2, "0")}`;

const normalizeFirstGroups = (groups) =>
  Array.isArray(groups)
    ? groups
      .filter((group) => group && group.id !== undefined)
      .map((group) => {
        const parsed = parseBuyCatalogGroupName(group.name || "");
        return {
          id: group.id,
          name: parsed.displayName,
          icon: parsed.icon,
        };
      })
      .filter((group) => group.name)
    : [];

const normalizeProductGroups = (groups) =>
  Array.isArray(groups)
    ? groups
      .filter((group) => group && group.id !== undefined)
      .map((group) => {
        const parsed = parseBuyCatalogGroupName(group.name || "");
        return {
          id: group.id,
          name: parsed.displayName,
          icon: parsed.icon,
        };
      })
      .filter((group) => group.name)
    : [];

const selectFirstGroup = async (groupId) => {
  if (String(activeFirstGroupId.value) === String(groupId)) {
    return;
  }

  await loadProducts({ first_gid: groupId });
};

const selectProductGroup = async (groupId) => {
  if (String(activeGroupId.value) === String(groupId)) {
    return;
  }

  await loadProducts({
    first_gid: activeFirstGroupId.value,
    gid: groupId,
  });
};

const loadProducts = async (query = {}) => {
  pageReady.value = false;
  loading.value = true;
  error.value = false;

  try {
    const res = useMockCatalog.value
      ? createMockCatalogResponse(query)
      : await api("/cart/home", { query });

    if (res?.success && res.data) {
      const nextFirstGroups = normalizeFirstGroups(res.data.first_groups);
      const nextProductGroups = normalizeProductGroups(res.data.product_groups);
      const nextProducts = Array.isArray(res.data.products)
        ? res.data.products
        : [];
      const resolvedFirstGroupId =
        query.first_gid ?? nextFirstGroups[0]?.id ?? null;

      if (query.first_gid === undefined && resolvedFirstGroupId !== null) {
        await loadProducts({
          first_gid: resolvedFirstGroupId,
        });
        return;
      }

      if (
        !nextProducts.length &&
        nextProductGroups.length &&
        query.gid === undefined
      ) {
        await loadProducts({
          first_gid: resolvedFirstGroupId,
          gid: nextProductGroups[0].id,
        });
        return;
      }

      firstGroups.value = nextFirstGroups;
      activeFirstGroupId.value = resolvedFirstGroupId;
      defaultCurrency.value = res.data.default_currency || null;

      if (nextProductGroups.length) {
        setGroups(
          nextProductGroups,
          nextProducts,
          query.gid ?? nextProductGroups[0]?.id ?? null
        );
      } else {
        activeGroupId.value = null;
        allGroups.value = nextProducts.length
          ? [{ id: 0, name: "", icon: "", items: nextProducts }]
          : [];
      }
    } else {
      error.value = true;
    }
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
    revealContent();
  }
};

onMounted(loadProducts);
</script>

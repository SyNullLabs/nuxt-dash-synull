<template>
  <div class="mx-auto w-full max-w-272">
    <div class="grid gap-6 md:gap-10">
      <div class="flex flex-wrap items-center justify-end gap-3">
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

      <UCard v-else-if="error" class="min-h-56" :ui="{
        root: 'rounded-[0.55rem]',
        body: 'grid place-items-center gap-3 p-8 text-center',
      }">
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
                  'shadow-[0_0_0_1px_rgba(124,58,237,0.3)] shadow-violet-500/30 bg-inherit font-black',
                trigger:
                  'min-w-fit data-[state=active]:font-black transition-colors duration-200 data-[state=inactive]:text-[var(--ui-text-muted)] data-[state=inactive]:hover:text-[var(--ui-text)] data-[state=active]:text-[var(--ui-text)]',
                leadingIcon: 'text-sm',
                content: 'font-black'
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
                :class="String(activeGroupId) === String(group.id)
                    ? 'ring-1 ring-inset ring-violet-500/20'
                    : ''
                  " :ui="{
                  root: 'rounded-[0.45rem] cursor-pointer',
                  body: 'p-4 min-h-[5.1rem] flex flex-col justify-center gap-3',
                }" @click="selectProductGroup(group.id)">
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
            leave-to-class="motion-reduce:transform-none opacity-0 -translate-y-2"
            @after-enter="queueProductCardContentInsetSync" mode="out-in">
            <div :key="`${activeFirstGroupId}-${activeGroupId}-${visibleProducts.length}`">
              <div v-if="visibleProducts.length" class="flex flex-wrap gap-5">
                <div v-for="(product, index) in visibleProducts" :key="product.id"
                  :ref="(element) => setProductCardRef(product.id, element)" class="flex w-full max-w-[20rem]">
                  <UCard variant="outline" class="flex min-h-full w-full flex-col" :ui="productCardUi">
                    <template #header>
                      <div data-product-card-header :style="getProductCardContentStyle(product.id, 'header')">
                        <div class="mb-3 h-0.75 w-3.5 rounded-full" :class="index % 3 === 0
                            ? 'bg-synull'
                            : index % 3 === 1
                              ? 'bg-violet-500'
                              : 'bg-violet-500'
                          "></div>

                        <p data-product-card-text class="m-0 text-[0.82rem] text-muted">
                          {{
                            activeSecondaryLabel || activePrimaryLabel || "SYNULL"
                          }}
                        </p>

                        <h2 data-product-card-text class="mt-2 text-[1.05rem] font-semibold text-default">
                          {{ product.name }}
                        </h2>

                        <p v-if="product.price_text" data-product-card-text
                          class="mt-2 text-[clamp(1.55rem,2vw,2rem)] font-semibold tracking-[-0.04em] text-default">
                          {{ product.price_text }}
                        </p>

                        <p v-else data-product-card-text class="mt-2 text-[0.88rem] font-semibold text-muted">
                          {{ t("configureProduct") }}
                        </p>
                      </div>
                    </template>

                    <div class="grid gap-3">
                      <div v-for="(spec, specIndex) in getProductSpecs(product)"
                        :key="`${product.id}-${spec}-${specIndex}`" data-product-card-spec-row
                        class="flex items-center justify-between gap-4">
                        <span data-product-card-text class="text-[0.78rem] font-semibold text-dimmed">
                          {{ formatSpecLabel(specIndex) }}
                        </span>
                        <span data-product-card-text
                          class="text-right font-mono text-[0.84rem] font-semibold text-default"
                          :style="getProductCardSpecValueStyle(product.id, specIndex)">
                          {{ spec }}
                        </span>
                      </div>
                    </div>

                    <template #footer>
                      <div data-product-card-footer class="flex items-center bg-violet-600"
                        :class="isOutOfStock(product) ? 'opacity-50 cursor-not-allowed' : ''">
                        <UButton data-product-card-box block type="button" size="md" :class="[
                          'rounded-none py-3 text-[0.85rem] font-bold motion-reduce:transform-none motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:opacity-95 motion-safe:active:opacity-80',
                          index % 3 === 0
                            ? 'bg-indigo-600/35'
                            : index % 3 === 1
                              ? 'bg-violet-600/35'
                              : 'bg-purple-600/35'
                        ]" color="primary" variant="solid" :disabled="isOutOfStock(product)"
                          @click="openProduct(product.id)">
                          <span :style="getProductCardFooterTextStyle(product.id)">
                            {{
                              isOutOfStock(product)
                                ? t("outOfStock")
                                : useMockCatalog
                                  ? "Mock 预览"
                                  : t("buyNow")
                            }}
                          </span>
                        </UButton>
                      </div>
                    </template>
                  </UCard>
                </div>
              </div>

              <UEmpty v-else icon="solar:box-bold-duotone" :description="t('noProducts')" :ui="{
                root: 'min-h-[14rem] rounded-[0.55rem] border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]',
              }" />
            </div>
          </Transition>
        </section>
      </div>
    </div>

    <BuyRegionGlobe :region="activeRegion" />
  </div>
</template>

<script setup lang="ts">
import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { parseBuyCatalogGroupName } from "~/utils/buy-catalog";
import { resolveBuyRegion } from "~/utils/buy-region";

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
type ProductCardContentInsets = {
  footer: number;
  header: number;
  specRows: number[];
};

const productCardContentInsetById = ref<Record<string, ProductCardContentInsets>>(
  {}
);

const productCardRefs = new Map<string, HTMLElement>();

let globeBreakpointQuery: MediaQueryList | null = null;
let productCardInsetSyncFrame: number | null = null;
let productCardScrollContainer: HTMLElement | null = null;
let productCardResizeObserver: ResizeObserver | null = null;

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
        allow_order: 0,
      },
      {
        id: "mock-standard-tokyo-exclusive",
        name: "Exclusive Tier",
        description: "8 vCPU\n16 GB 内存\n320 GB NVMe\n10 TB 月流量",
        price_text: "¥328 / 月",
      },
      {
        id: "mock-standard-tokyo-exclusive-plus",
        name: "Exclusive Plus Tier",
        description: "16 vCPU\n32 GB 内存\n640 GB NVMe\n20 TB 月流量",
        price_text: "¥648 / 月",
      },
      {
        id: "mock-standard-tokyo-exclusive-plus-plus",
        name: "Exclusive Plus Plus Tier",
        description: "32 vCPU\n64 GB 内存\n1 TB NVMe\n20 TB 月流量",
        price_text: "¥1288 / 月",
      },
      {
        id: "mock-standard-tokyo-exclusive-plus-plus-plus",
        name: "Exclusive Plus Plus Plus Tier",
        description: "64 vCPU\n128 GB 内存\n2 TB NVMe\n20 TB 月流量",
        price_text: "¥2568 / 月",
      },
      {
        id: "mock-standard-tokyo-exclusive-plus-plus-plus-plus",
        name: "Exclusive Plus Plus Plus Plus Tier",
        description: "128 vCPU\n256 GB 内存\n4 TB NVMe\n20 TB 月流量",
        price_text: "¥5128 / 月",
      },
      {
        id: "mock-standard-tokyo-exclusive-plus-plus-plus-plus-plus",
        name: "Exclusive Plus Plus Plus Plus Plus Tier",
        description: "256 vCPU\n512 GB 内存\n8 TB NVMe\n20 TB 月流量",
        price_text: "¥10248 / 月",
      },
      {
        id: "mock-standard-tokyo-exclusive-plus-plus-plus-plus-plus-plus",
        name: "Exclusive Plus Plus Plus Plus Plus Plus Tier",
        description: "512 vCPU\n1 TB 内存\n16 TB NVMe\n20 TB 月流量",
        price_text: "¥20488 / 月",
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

const GLOBE_BREAKPOINT_QUERY = "(min-width: 1536px)";
const GLOBE_OVERLAY_SIZE_PX = 26 * 16;
const PRODUCT_CARD_BASE_CONTENT_INSET_PX = 0;
const PRODUCT_CARD_GLOBE_CLEARANCE_PX = 48;
const PRODUCT_CARD_MAX_EXTRA_CONTENT_PADDING_PX = 96;
const PRODUCT_CARD_FOOTER_TEXT_BIAS_PX = 8;
const PRODUCT_CARD_TEXT_SELECTOR = "[data-product-card-text]";
const PRODUCT_CARD_BOX_SELECTOR = "[data-product-card-box]";
const PRODUCT_CARD_HEADER_SELECTOR = "[data-product-card-header]";
const PRODUCT_CARD_SPEC_ROW_SELECTOR = "[data-product-card-spec-row]";
const PRODUCT_CARD_FOOTER_SELECTOR = "[data-product-card-footer]";
const productCardTextCache = new Map<
  string,
  ReturnType<typeof prepareWithSegments>
>();

const productCardUi = {
  root: "rounded-[0.55rem]",
  header: "p-6",
  body: "flex-1 p-6",
  footer: "bg-[var(--ui-bg)]/50 p-0 sm:p-0",
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createProductCardContentInsets = (
  specRowCount = 0
): ProductCardContentInsets => ({
  footer: PRODUCT_CARD_BASE_CONTENT_INSET_PX,
  header: PRODUCT_CARD_BASE_CONTENT_INSET_PX,
  specRows: Array.from({ length: specRowCount }, () => PRODUCT_CARD_BASE_CONTENT_INSET_PX),
});

const getTrackedLineWidth = (
  lineText: string,
  lineWidth: number,
  letterSpacing: number
) =>
  lineWidth + Math.max(Array.from(lineText).length - 1, 0) * letterSpacing;

const getPreparedProductCardText = (text: string, font: string) => {
  const cacheKey = `${font}__${text}`;
  const cachedText = productCardTextCache.get(cacheKey);

  if (cachedText) {
    return cachedText;
  }

  const preparedText = prepareWithSegments(text, font);
  productCardTextCache.set(cacheKey, preparedText);

  return preparedText;
};

const getProductCardTextRight = (element: HTMLElement) => {
  const text = element.textContent?.trim();

  if (!text) {
    return element.getBoundingClientRect().left;
  }

  const style = window.getComputedStyle(element);
  const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const preparedText = getPreparedProductCardText(text, font);
  const lineHeight = Number.parseFloat(style.lineHeight);
  const letterSpacing = Number.parseFloat(style.letterSpacing);
  const layout = layoutWithLines(
    preparedText,
    Math.max(element.clientWidth, 1),
    Number.isFinite(lineHeight)
      ? lineHeight
      : Math.max(Number.parseFloat(style.fontSize) * 1.2, 1)
  );
  const widestLine = layout.lines.reduce(
    (maxWidth, line) =>
      Math.max(
        maxWidth,
        getTrackedLineWidth(
          line.text,
          line.width,
          Number.isFinite(letterSpacing) ? letterSpacing : 0
        )
      ),
    0
  );

  return element.getBoundingClientRect().left + widestLine;
};

const setProductCardRef = (productId, element: Element | null) => {
  const normalizedProductId = String(productId);
  const previousElement = productCardRefs.get(normalizedProductId);

  if (previousElement && previousElement !== element) {
    productCardResizeObserver?.unobserve(previousElement);
  }

  if (element instanceof HTMLElement) {
    productCardRefs.set(normalizedProductId, element);
    productCardResizeObserver?.observe(element);
    queueProductCardContentInsetSync();
    return;
  }

  productCardRefs.delete(normalizedProductId);
};

const getRequiredProductCardInset = (
  rightEdge: number,
  top: number,
  bottom: number,
  globeLeft: number,
  globeTop: number,
  viewportBottom: number
) => {
  const boundaryTop = Math.max(top, globeTop);
  const boundaryBottom = Math.min(bottom, viewportBottom);

  if (boundaryBottom <= boundaryTop) {
    return PRODUCT_CARD_BASE_CONTENT_INSET_PX;
  }

  const radius = GLOBE_OVERLAY_SIZE_PX / 2;
  const centerX = globeLeft + radius;
  const centerY = globeTop + radius;
  const nearestY = clamp(centerY, boundaryTop, boundaryBottom);
  const distanceFromCenterY = Math.abs(nearestY - centerY);
  const boundaryLeft =
    centerX -
    Math.sqrt(Math.max(radius * radius - distanceFromCenterY * distanceFromCenterY, 0));
  const extraInset = clamp(
    rightEdge - boundaryLeft + PRODUCT_CARD_GLOBE_CLEARANCE_PX,
    0,
    PRODUCT_CARD_MAX_EXTRA_CONTENT_PADDING_PX
  );

  return PRODUCT_CARD_BASE_CONTENT_INSET_PX + extraInset;
};

const syncProductCardContentInsets = () => {
  const nextInsets = Object.fromEntries(
    visibleProducts.value.map((product) => [
      String(product.id),
      createProductCardContentInsets(getProductSpecs(product).length),
    ])
  );

  if (!import.meta.client || !activeRegion.value || !globeBreakpointQuery?.matches) {
    productCardContentInsetById.value = nextInsets;
    return;
  }

  const mainElement = document.getElementById("dashboard-main");

  if (!mainElement) {
    productCardContentInsetById.value = nextInsets;
    return;
  }

  const mainRect = mainElement.getBoundingClientRect();
  const globeLeft = mainRect.right - GLOBE_OVERLAY_SIZE_PX;
  const globeTop = mainRect.bottom - GLOBE_OVERLAY_SIZE_PX;

  visibleProducts.value.forEach((product) => {
    const productId = String(product.id);
    const element = productCardRefs.get(productId);

    if (!element) {
      return;
    }

    const headerElement = element.querySelector<HTMLElement>(
      PRODUCT_CARD_HEADER_SELECTOR
    );

    if (headerElement) {
      const headerRect = headerElement.getBoundingClientRect();
      const headerTextRight = Array.from(
        headerElement.querySelectorAll<HTMLElement>(PRODUCT_CARD_TEXT_SELECTOR)
      ).reduce(
        (maxRight, textElement) => Math.max(maxRight, getProductCardTextRight(textElement)),
        0
      );

      nextInsets[productId].header = getRequiredProductCardInset(
        headerTextRight,
        headerRect.top,
        headerRect.bottom,
        globeLeft,
        globeTop,
        mainRect.bottom
      );
    }

    const specRowElements = Array.from(
      element.querySelectorAll<HTMLElement>(PRODUCT_CARD_SPEC_ROW_SELECTOR)
    );

    nextInsets[productId].specRows = specRowElements.map((specRowElement) => {
      const specRowRect = specRowElement.getBoundingClientRect();

      return getRequiredProductCardInset(
        specRowRect.right,
        specRowRect.top,
        specRowRect.bottom,
        globeLeft,
        globeTop,
        mainRect.bottom
      );
    });

    const footerElement = element.querySelector<HTMLElement>(
      PRODUCT_CARD_FOOTER_SELECTOR
    );

    if (footerElement) {
      const footerRect = footerElement.getBoundingClientRect();
      const footerBoxRight = Array.from(
        footerElement.querySelectorAll<HTMLElement>(PRODUCT_CARD_BOX_SELECTOR)
      ).reduce((maxRight, boxElement) => Math.max(maxRight, boxElement.getBoundingClientRect().right), footerRect.right);

      nextInsets[productId].footer = getRequiredProductCardInset(
        footerBoxRight,
        footerRect.top,
        footerRect.bottom,
        globeLeft,
        globeTop,
        mainRect.bottom
      );
    }
  });

  productCardContentInsetById.value = nextInsets;
};

const queueProductCardContentInsetSync = () => {
  if (!import.meta.client || productCardInsetSyncFrame !== null) {
    return;
  }

  productCardInsetSyncFrame = window.requestAnimationFrame(() => {
    productCardInsetSyncFrame = null;
    syncProductCardContentInsets();
  });
};

const getProductCardContentStyle = (
  productId,
  section: "footer" | "header"
) => {
  const contentInset =
    productCardContentInsetById.value[String(productId)]?.[section] ??
    PRODUCT_CARD_BASE_CONTENT_INSET_PX;

  return contentInset ? { paddingRight: `${contentInset}px` } : undefined;
};

const getProductCardSpecValueStyle = (productId, specIndex: number) => {
  const contentInset =
    productCardContentInsetById.value[String(productId)]?.specRows?.[specIndex] ??
    PRODUCT_CARD_BASE_CONTENT_INSET_PX;

  return contentInset
    ? {
      display: "inline-block",
      transform: `translateX(-${contentInset}px)`,
    }
    : undefined;
};

const getProductCardFooterTextStyle = (productId) => {
  const contentInset =
    productCardContentInsetById.value[String(productId)]?.footer ??
    PRODUCT_CARD_BASE_CONTENT_INSET_PX;
  const footerShift = contentInset
    ? contentInset + PRODUCT_CARD_FOOTER_TEXT_BIAS_PX
    : 0;

  return footerShift
    ? {
      display: "inline-block",
      transform: `translateX(-${footerShift}px)`,
    }
    : undefined;
};

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

const activeRegion = computed(() => {
  if (loading.value || error.value) {
    return null;
  }

  return (
    resolveBuyRegion(activeSecondaryLabel.value) ||
    resolveBuyRegion(activePrimaryLabel.value)
  );
});

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

const isOutOfStock = (product) =>
  product?.allow_order === 0 ||
  product?.allow_order === false ||
  product?.stock === 0 ||
  product?.is_available === false;

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

onMounted(() => {
  loadProducts();

  if (!import.meta.client) {
    return;
  }

  globeBreakpointQuery = window.matchMedia(GLOBE_BREAKPOINT_QUERY);
  productCardScrollContainer = document.getElementById("dashboard-main");
  productCardResizeObserver = new ResizeObserver(queueProductCardContentInsetSync);

  globeBreakpointQuery.addEventListener("change", queueProductCardContentInsetSync);
  window.addEventListener("resize", queueProductCardContentInsetSync);
  productCardScrollContainer?.addEventListener(
    "scroll",
    queueProductCardContentInsetSync,
    { passive: true }
  );

  nextTick(queueProductCardContentInsetSync);
  document.fonts?.ready.then(queueProductCardContentInsetSync);
});

onBeforeUnmount(() => {
  globeBreakpointQuery?.removeEventListener("change", queueProductCardContentInsetSync);
  window.removeEventListener("resize", queueProductCardContentInsetSync);
  productCardScrollContainer?.removeEventListener(
    "scroll",
    queueProductCardContentInsetSync
  );
  productCardResizeObserver?.disconnect();

  if (productCardInsetSyncFrame !== null) {
    window.cancelAnimationFrame(productCardInsetSyncFrame);
  }
});

watch([visibleProducts, activeRegion], async () => {
  await nextTick();
  queueProductCardContentInsetSync();
});
</script>

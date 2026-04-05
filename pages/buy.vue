<template>
  <div class="mx-auto grid w-full max-w-[68rem] gap-6 md:gap-10">
    <header
      class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between"
    >
      <div class="flex items-start gap-3">
        <div class="flex gap-[3px] pt-1" aria-hidden="true">
          <span class="h-[18px] w-[5px] rounded-full bg-[#ef476f]"></span>
          <span class="h-[18px] w-[5px] rounded-full bg-[#ff8a5b]"></span>
          <span class="h-[18px] w-[5px] rounded-full bg-[#ffc07f]"></span>
        </div>

        <div>
          <p
            class="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--ui-text-dimmed)]"
          >
            SYNULL ORDER FLOW
          </p>
          <h1
            class="mt-1 text-[clamp(2rem,3vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--ui-text)]"
          >
            {{ t("buy") }}
          </h1>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 md:justify-end">
        <div
          v-if="defaultCurrencyLabel"
          class="rounded-[0.45rem] border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] px-4 py-2 text-[0.82rem] font-semibold tracking-[0.08em] text-[var(--ui-text-muted)]"
        >
          {{ defaultCurrencyLabel }}
        </div>

        <UButton
          to="/cart"
          variant="soft"
          color="neutral"
          icon="i-solar-cart-large-bold-duotone"
          :label="t('viewCart')"
        />
      </div>
    </header>

    <p
      class="max-w-[46rem] text-[0.98rem] leading-7 text-[var(--ui-text-muted)]"
    >
      {{ pageSummary }}
    </p>

    <div v-if="loading" class="grid gap-10">
      <section class="grid gap-4">
        <USkeleton class="h-3 w-28 rounded-full" />
        <div class="flex flex-wrap gap-2">
          <USkeleton
            v-for="item in 3"
            :key="`type-${item}`"
            class="h-11 w-36 rounded-md"
          />
        </div>
      </section>

      <section class="grid gap-4">
        <USkeleton class="h-3 w-32 rounded-full" />
        <div class="flex flex-wrap gap-3">
          <USkeleton
            v-for="item in 4"
            :key="`group-${item}`"
            class="h-24 w-full max-w-[20rem] rounded-lg"
          />
        </div>
      </section>

      <section class="grid gap-4">
        <USkeleton class="h-3 w-36 rounded-full" />
        <div class="flex flex-wrap gap-5">
          <USkeleton
            v-for="item in 3"
            :key="`plan-${item}`"
            class="h-72 w-full max-w-[20rem] rounded-lg"
          />
        </div>
      </section>
    </div>

    <div
      v-else-if="error"
      class="grid min-h-[14rem] place-items-center gap-3 rounded-[0.55rem] border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-8 text-center"
    >
      <Icon
        name="solar:danger-triangle-bold-duotone"
        class="text-[2.2rem] text-[#ff8a5b]"
      />
      <p class="m-0 text-[var(--ui-text-muted)]">
        {{ t("loadProductsFailed") }}
      </p>
      <UButton @click="loadProducts" variant="soft" :label="t('retry')" />
    </div>

    <div v-else class="grid gap-10">
      <section class="grid gap-4">
        <span
          class="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--ui-text-dimmed)]"
        >
          01 PRODUCT LINE
        </span>

        <div
          class="inline-flex max-w-full flex-wrap gap-px rounded-[0.4rem] bg-[var(--ui-border)] p-px"
        >
          <button
            v-for="group in firstGroups"
            :key="group.id"
            type="button"
            class="inline-flex items-center gap-2 rounded-[0.32rem] px-4 py-3 text-[0.84rem] font-semibold transition-colors duration-200"
            :class="
              String(activeFirstGroupId) === String(group.id)
                ? 'bg-[var(--ui-bg-soft)] text-[var(--ui-text)]'
                : 'bg-[var(--ui-bg)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
            "
            @click="selectFirstGroup(group.id)"
          >
            <Icon v-if="group.icon" :name="group.icon" class="text-sm" />
            <span>{{ group.name }}</span>
          </button>
        </div>
      </section>

      <section v-if="hasCategoryGroups" class="grid gap-4">
        <span
          class="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--ui-text-dimmed)]"
        >
          02 PRODUCT GROUP
        </span>

        <div class="flex flex-wrap gap-3">
          <button
            v-for="group in allGroups"
            :key="group.id"
            type="button"
            class="relative grid min-h-[5.1rem] w-full max-w-[20rem] gap-3 overflow-hidden rounded-[0.45rem] border px-4 py-4 text-left transition-transform duration-200"
            :class="
              String(activeGroupId) === String(group.id)
                ? 'border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] ring-1 ring-inset ring-[#ef476f]/30'
                : 'border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] hover:-translate-y-0.5'
            "
            @click="selectProductGroup(group.id)"
          >
            <span
              class="absolute inset-y-0 left-0 w-[3px]"
              :class="
                String(activeGroupId) === String(group.id)
                  ? 'bg-gradient-to-b from-[#ef476f] via-[#ff8a5b] to-[#ffc07f]'
                  : 'bg-transparent'
              "
            ></span>

            <div
              class="flex items-center justify-between text-[var(--ui-text-dimmed)]"
            >
              <Icon v-if="group.icon" :name="group.icon" class="text-base" />
              <span
                v-if="String(activeGroupId) === String(group.id)"
                class="text-[0.7rem] font-bold tracking-[0.12em]"
              >
                ACTIVE
              </span>
            </div>

            <span class="text-[0.98rem] font-semibold text-[var(--ui-text)]">
              {{ group.name }}
            </span>
          </button>
        </div>
      </section>

      <section class="grid gap-4">
        <span
          class="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--ui-text-dimmed)]"
        >
          03 AVAILABLE PLANS
        </span>

        <div v-if="visibleProducts.length" class="flex flex-wrap gap-5">
          <article
            v-for="(product, index) in visibleProducts"
            :key="product.id"
            class="flex min-h-full w-full max-w-[20rem] flex-col overflow-hidden rounded-[0.55rem] border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]"
          >
            <div class="border-b border-[var(--ui-border)] p-6">
              <div
                class="mb-3 h-[3px] w-[14px] rounded-full"
                :class="
                  index % 3 === 0
                    ? 'bg-[#ef476f]'
                    : index % 3 === 1
                    ? 'bg-[#ff8a5b]'
                    : 'bg-[#ffc07f]'
                "
              ></div>

              <p class="m-0 text-[0.82rem] text-[var(--ui-text-muted)]">
                {{ activeSecondaryLabel || activePrimaryLabel || "SYNULL" }}
              </p>

              <h2
                class="mt-2 text-[1.05rem] font-semibold text-[var(--ui-text)]"
              >
                {{ product.name }}
              </h2>

              <p
                v-if="product.price_text"
                class="mt-2 text-[clamp(1.55rem,2vw,2rem)] font-semibold tracking-[-0.04em] text-[var(--ui-text)]"
              >
                {{ product.price_text }}
              </p>

              <p
                v-else
                class="mt-2 text-[0.88rem] font-semibold text-[var(--ui-text-muted)]"
              >
                {{ t("configureProduct") }}
              </p>
            </div>

            <div class="grid flex-1 gap-3 p-6">
              <div
                v-for="(spec, specIndex) in getProductSpecs(product)"
                :key="`${product.id}-${spec}-${specIndex}`"
                class="flex items-center justify-between gap-4"
              >
                <span
                  class="text-[0.78rem] font-semibold text-[var(--ui-text-dimmed)]"
                >
                  {{ formatSpecLabel(specIndex) }}
                </span>
                <span
                  class="text-right font-mono text-[0.84rem] font-semibold text-[var(--ui-text)]"
                >
                  {{ spec }}
                </span>
              </div>
            </div>

            <div class="bg-[var(--ui-bg)]/50 p-5">
              <button
                type="button"
                class="w-full rounded-[0.25rem] px-4 py-3 text-[0.85rem] font-bold text-white transition-opacity duration-200 hover:opacity-95"
                :class="
                  index % 3 === 0
                    ? 'bg-[#ef476f]'
                    : index % 3 === 1
                    ? 'bg-[#ff8a5b]'
                    : 'bg-[#ffc07f] text-[var(--ui-bg)]'
                "
                @click="openProduct(product.id)"
              >
                {{ t("buyNow") }}
              </button>
            </div>
          </article>
        </div>

        <div
          v-else
          class="grid min-h-[14rem] place-items-center gap-3 rounded-[0.55rem] border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-8 text-center"
        >
          <Icon
            name="solar:box-bold-duotone"
            class="text-[2.2rem] text-[var(--ui-text-dimmed)]"
          />
          <p class="m-0 text-[var(--ui-text-muted)]">{{ t("noProducts") }}</p>
        </div>
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

const pageSummary = computed(() => {
  const activeSelection = [activePrimaryLabel.value, activeSecondaryLabel.value]
    .filter(Boolean)
    .join(" / ");
  const firstProductName = visibleProducts.value[0]?.name || "";

  return (
    [activeSelection, firstProductName].filter(Boolean).join(" · ") || t("buy")
  );
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

const openProduct = (productId) => {
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
  loading.value = true;
  error.value = false;

  try {
    const res = await api("/cart/home", { query });

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
  }
};

onMounted(loadProducts);
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-white">{{ t("buy") }}</h1>
      <UButton
        to="/cart"
        variant="ghost"
        color="neutral"
        icon="i-solar-cart-large-bold-duotone"
        :label="t('viewCart')"
        class="text-white/60 hover:text-white"
      />
    </div>

    <nav
      v-if="!loading && !error && hasCategoryGroups"
      class="mb-5 flex gap-1 overflow-x-auto border-b border-white/8 pb-px"
    >
      <button
        v-if="allGroups.length > 1"
        :class="[
          'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
          activeGroupId === null
            ? 'border-synull text-synull'
            : 'border-transparent text-white/45 hover:text-white/70',
        ]"
        @click="activeGroupId = null"
      >
        {{ t('allProducts') }}
        <span class="text-xs opacity-60">({{ totalProductCount }})</span>
      </button>
      <button
        v-for="group in allGroups"
        :key="group.id"
        :class="[
          'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
          activeGroupId === group.id
            ? 'border-synull text-synull'
            : 'border-transparent text-white/45 hover:text-white/70',
        ]"
        @click="activeGroupId = group.id"
      >
        <Icon v-if="group.icon" :name="group.icon" class="text-sm" />
        {{ group.name }}
        <span class="text-xs opacity-60">({{ group.items.length }})</span>
      </button>
    </nav>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="n in 3" :key="n" class="dashboard-panel rounded-2xl p-5">
        <USkeleton class="mb-3 h-5 w-24 rounded-lg" />
        <USkeleton class="mb-2 h-4 w-full rounded-lg" />
        <USkeleton class="h-4 w-3/4 rounded-lg" />
      </div>
    </div>

    <div v-else-if="error" class="dashboard-panel rounded-2xl p-8 text-center">
      <Icon
        name="solar:danger-triangle-bold-duotone"
        class="mx-auto mb-3 text-4xl text-yellow-500"
      />
      <p class="mb-4 text-white/60">{{ t("loadProductsFailed") }}</p>
      <UButton @click="loadProducts" variant="soft" :label="t('retry')" />
    </div>

    <div v-else>
      <div
        v-for="group in visibleGroups"
        :key="group.id"
        class="mb-6"
      >
        <h2
          v-if="group.name && (allGroups.length > 1 || activeGroupId !== null)"
          class="mb-3 flex items-center gap-2 text-sm font-medium tracking-wide text-white/40 uppercase"
        >
          <Icon v-if="group.icon" :name="group.icon" class="text-base text-white/50" />
          {{ group.name }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="product in group.items"
            :key="product.id"
            @click="navigateTo(`/buy/${product.id}`)"
            class="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-all duration-200 hover:border-synull/30 hover:bg-white/[0.06]"
          >
            <div class="mb-3 flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-synull/12 text-synull transition-colors group-hover:bg-synull/20"
              >
                <Icon :name="getProductIcon(product)" class="text-lg" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-base font-medium text-white">
                  {{ product.name }}
                </h3>
              </div>
            </div>
            <p
              v-if="product.description"
              class="mb-3 line-clamp-2 text-sm leading-relaxed text-white/45"
            >
              {{ product.description }}
            </p>
            <div
              v-if="product.price_text"
              class="text-sm font-medium text-synull"
            >
              {{ product.price_text }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="visibleGroups.length === 0"
        class="dashboard-panel rounded-2xl p-10 text-center"
      >
        <Icon
          name="solar:box-bold-duotone"
          class="mx-auto mb-3 text-4xl text-white/20"
        />
        <p class="text-white/45">{{ t("noProducts") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();

const loading = ref(true);
const error = ref(false);
const allGroups = ref([]);
const activeGroupId = ref(null);

const hasCategoryGroups = computed(() =>
  allGroups.value.some((group) => Boolean(group.name))
);

const visibleGroups = computed(() => {
  if (activeGroupId.value === null) return allGroups.value;
  return allGroups.value.filter((g) => g.id === activeGroupId.value);
});

const totalProductCount = computed(() =>
  allGroups.value.reduce((sum, g) => sum + g.items.length, 0)
);

const setGroups = (groups) => {
  allGroups.value = groups;
  activeGroupId.value = groups.length === 1 && groups[0]?.name ? groups[0].id : null;
};

const getProductIcon = (product) => {
  if (product._icon) return product._icon;
  const name = (product.name || "").toLowerCase();
  if (name.includes("cvm") || name.includes("云服务器"))
    return "solar:server-bold-duotone";
  if (name.includes("tcvm") || name.includes("流量"))
    return "solar:cloud-bolt-minimalistic-bold-duotone";
  if (name.includes("host") || name.includes("虚拟主机"))
    return "solar:global-bold-duotone";
  return "solar:widget-2-bold-duotone";
};

/**
 * Parse group name which may contain embedded metadata.
 * Format: "displayName, cssClasses, meta, iconIdentifier"
 * Returns { displayName, icon, cssClasses }
 */
const parseGroupName = (raw) => {
  if (!raw) return { displayName: "", icon: "", cssClasses: "" };

  const parts = raw.split(",").map((s) => s.trim());
  let icon = "";
  let displayName = "";
  const cssParts = [];

  for (const part of parts) {
    if (!part) continue;
    const normalized = part.replace("/", ":");
    if (/^[a-z0-9-]+:[a-z0-9-]+/i.test(normalized)) {
      icon = normalized;
    } else if (/^[a-z0-9 -]+$/i.test(part) && part.includes("-") && part.includes(" ")) {
      cssParts.push(part);
    } else if (/^\d+$/.test(part)) {
      // Pure number, skip (ordering metadata)
    } else if (!displayName) {
      displayName = part;
    }
  }

  if (!displayName) displayName = raw;

  return { displayName, icon, cssClasses: cssParts.join(" ") };
};

const loadProducts = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await api("/cart/products");
    if (res?.success && res.data) {
      const data = res.data;
      if (Array.isArray(data)) {
        setGroups([{ id: 0, name: "", icon: "", items: data }]);
      } else if (data.products && Array.isArray(data.products)) {
        setGroups(
          data.products
            .filter((g) => g.products && g.products.length > 0)
            .map((g) => {
              const parsed = parseGroupName(g.name);
              return {
                id: g.id,
                name: parsed.displayName,
                icon: parsed.icon,
                cssClasses: parsed.cssClasses,
                items: g.products,
              };
            })
        );
      } else if (data.products) {
        const groups = [];
        for (const [groupName, items] of Object.entries(data.products)) {
          const parsed = parseGroupName(groupName);
          groups.push({
            id: groupName,
            name: parsed.displayName,
            icon: parsed.icon,
            items: Array.isArray(items) ? items : [],
          });
        }
        setGroups(groups.filter((g) => g.items.length > 0));
      } else {
        const items = Object.values(data).filter(
          (v) => typeof v === "object" && v !== null && v.id
        );
        setGroups(items.length ? [{ id: 0, name: "", icon: "", items }] : []);
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

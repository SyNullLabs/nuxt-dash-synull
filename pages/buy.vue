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
        v-for="(group, gIdx) in productGroups"
        :key="gIdx"
        class="mb-6"
      >
        <h2
          v-if="productGroups.length > 1"
          class="mb-3 text-sm font-medium tracking-wide text-white/40 uppercase"
        >
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
        v-if="productGroups.length === 0"
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();

const loading = ref(true);
const error = ref(false);
const productGroups = ref([]);

const getProductIcon = (product) => {
  const name = (product.name || "").toLowerCase();
  if (name.includes("cvm") || name.includes("云服务器"))
    return "solar:server-bold-duotone";
  if (name.includes("tcvm") || name.includes("流量"))
    return "solar:cloud-bolt-minimalistic-bold-duotone";
  if (name.includes("host") || name.includes("虚拟主机"))
    return "solar:global-bold-duotone";
  return "solar:widget-2-bold-duotone";
};

const loadProducts = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await api("/cart/products");
    if (res?.success && res.data) {
      const data = res.data;
      if (Array.isArray(data)) {
        productGroups.value = [{ name: "", items: data }];
      } else if (data.products) {
        // Grouped products from backend
        const groups = [];
        if (Array.isArray(data.products)) {
          groups.push({ name: t("allProducts"), items: data.products });
        } else {
          for (const [groupName, items] of Object.entries(data.products)) {
            groups.push({
              name: groupName,
              items: Array.isArray(items) ? items : [],
            });
          }
        }
        productGroups.value = groups;
      } else {
        // Fallback: treat entire data as flat product list
        const items = Object.values(data).filter(
          (v) => typeof v === "object" && v !== null && v.id
        );
        productGroups.value = items.length
          ? [{ name: "", items }]
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

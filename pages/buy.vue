<template>
  <div class="mb-4">
    <nav class="m-0 flex flex-row items-center gap-1 text-sm text-white/45">
      <router-link to="/" class="flex flex-row items-center">
        <Icon name="solar:home-2-bold-duotone" class="text-synull text-xl" />
      </router-link>
      <Icon
        name="solar:alt-arrow-right-outline"
        class="text-gray-500 text-lg"
      />
      <span class="flex flex-row items-center gap-1 text-white/45">{{
        t("buy")
      }}</span>
    </nav>
  </div>
  <div class="dashboard-panel flex flex-col gap-5 rounded-[1.75rem] p-5">
    <div class="product-header">
      <Icon name="" class="text-synull" />
      <span class="text-xl font-medium text-white">产品类型</span>
    </div>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="product in products"
        :key="product.id"
        @click="goToProduct(product.route)"
        :class="[
          'product-item rounded-[1.5rem] border p-3 transition-all duration-300 ease-out hover:-translate-y-1',
          product.bgClass,
          product.hoverClass,
        ]"
      >
        <div
          class="flex cursor-pointer items-start rounded-[1.15rem] bg-black/16 px-4 py-5 text-white"
        >
          <div class="flex flex-col">
            <span class="mb-1 text-2xl">{{ product.name }}</span>
            <span class="text-sm text-white/62">{{ product.description }}</span>
          </div>
          <Icon
            v-if="showInfo"
            name="fa:circle-info"
            class="ml-2 mt-1 text-white/45"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const showInfo = false;

const goToProduct = (route) => {
  navigateTo(route);
};

const products = ref([
  {
    id: 1,
    name: "CVM",
    description: "经典型云服务器",
    route: "/buy/1",
    bgClass:
      "border-synull/25 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.24),transparent_42%),rgba(255,255,255,0.05)] shadow-[0_20px_60px_rgba(7,7,15,0.4)] backdrop-blur-xl",
    hoverClass: "hover:border-synull/40 hover:bg-white/8",
  },
  {
    id: 5,
    name: "TCVM",
    description: "流量型云服务器",
    route: "/buy/5",
    bgClass: "border-white/10 bg-white/5 backdrop-blur-xl",
    hoverClass: "hover:border-white/18 hover:bg-white/8",
  },
  {
    id: 4,
    name: "HOST",
    description: "云虚拟主机",
    route: "/buy/4",
    bgClass: "border-white/10 bg-white/5 backdrop-blur-xl",
    hoverClass: "hover:border-white/18 hover:bg-white/8",
  },
]);
</script>

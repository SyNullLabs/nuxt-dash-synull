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
</template>

<script setup>
import { ref } from "vue";
// 确保导入 i18n
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 使用 useI18n 钩子

const home = ref({
  icon: "solar:home-2-bold-duotone",
  route: "/",
  class: "text-synull text-xl",
});
const items = ref([
  { label: t("productManagement"), class: "text-white/45" },
  { label: t("trafficCloudVirtualMachine"), class: "text-white/45" },
]);
</script>

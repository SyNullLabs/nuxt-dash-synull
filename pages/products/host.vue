<template>
  <div class="mb-4">
    <nav class="text-gray-300 text-sm flex flex-row items-center m-0 gap-1">
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
          class="text-gray-500 text-lg ml"
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
  { label: t("productManagement"), class: "text-gray-500" },
  { label: t("virtualHosts"), class: "text-gray-500" },
]);
</script>

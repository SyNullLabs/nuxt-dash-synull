<template>
  <div>
    <div class="mb-5">
      <h1 class="text-xl font-semibold text-white">{{ t("virtualHosts") }}</h1>
    </div>
    <ProductList type="host" :title="t('virtualHosts')" />
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

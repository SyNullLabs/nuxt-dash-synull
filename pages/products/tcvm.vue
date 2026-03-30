<template>
  <div>
    <div class="mb-5">
      <h1 class="text-xl font-semibold text-white">{{ t("trafficCloudVirtualMachine") }}</h1>
    </div>
    <ProductList type="tcvm" :title="t('trafficCloudVirtualMachine')" />
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

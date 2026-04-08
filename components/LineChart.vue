<template>
  <VChart :option="option" autoresize class="chart-container" />
</template>

<script setup>
defineProps({
  option: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>

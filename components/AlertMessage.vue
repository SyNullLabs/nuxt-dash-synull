<template>
  <transition name="slide-fade">
    <div
      v-if="show"
      :class="[
        'fixed left-1/2 top-5 z-50 flex min-w-[220px] max-w-[80%] -translate-x-1/2 items-center rounded-full px-4 py-3 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-300 ease-in-out backdrop-blur-xl',
        typeClasses,
      ]"
      role="alert"
    >
      <Icon :name="iconName" class="w-6 h-6 mr-2" />
      <span class="text-sm">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";
import { useAlertStore } from "~/stores/alert";

const alertStore = useAlertStore();

const show = computed(() => alertStore.show);
const message = computed(() => alertStore.message);
const type = computed(() => alertStore.type);

const typeClasses = computed(() => {
  switch (type.value) {
    case "success":
      return "border border-emerald-400/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-100";
    case "error":
      return "border border-rose-400/25 bg-rose-500/12 text-rose-700 dark:text-rose-100";
    case "info":
      return "border border-sky-400/25 bg-sky-500/12 text-sky-700 dark:text-sky-100";
    default:
      return "border border-synull/25 bg-synull/12 text-[color:var(--ui-text)]";
  }
});

const iconName = computed(() => {
  switch (type.value) {
    case "success":
      return "solar:smile-circle-bold-duotone";
    case "error":
      return "solar:confounded-circle-bold-duotone";
    case "info":
      return "solar:info-circle-bold-duotone";
    default:
      return "solar:hashtag-circle-bold-duotone";
  }
});
</script>

<style scoped>
/* 保留 slide-fade 动画相关的样式 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px) translateX(-50%);
  opacity: 0;
}
</style>

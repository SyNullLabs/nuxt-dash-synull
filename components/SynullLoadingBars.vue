<template>
  <div class="flex items-center gap-3 text-muted">
    <div class="flex gap-0.75" aria-hidden="true">
      <span
        :class="[
          barClass,
          'bg-synull-400 motion-safe:animate-[pulse_1.2s_ease-in-out_infinite]',
        ]"
      ></span>
      <span
        :class="[
          barClass,
          'bg-emerald-500 [animation-delay:120ms] motion-safe:animate-[pulse_1.2s_ease-in-out_infinite]',
        ]"
      ></span>
      <span
        :class="[
          barClass,
          'bg-violet-500 [animation-delay:240ms] motion-safe:animate-[pulse_1.2s_ease-in-out_infinite]',
        ]"
      ></span>
    </div>

    <span v-if="label" class="text-sm font-medium">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const barClass = computed(() =>
  props.compact ? "h-3 w-1 rounded-full" : "h-4 w-[5px] rounded-full"
);
</script>

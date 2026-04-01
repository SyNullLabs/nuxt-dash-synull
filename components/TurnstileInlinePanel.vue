<template>
  <div class="w-full">
    <slot v-if="!isActive" />

    <div v-else class="space-y-2">
      <ClientOnly>
        <div class="relative min-h-[66px] overflow-hidden rounded-[0.7rem]">
          <NuxtTurnstile
            :key="nonce"
            v-model="model"
            class="relative z-10 block min-h-[66px] w-full"
            :options="{ size: 'flexible' }"
            @error="$emit('error')"
          />

          <USkeleton
            v-if="!model"
            class="absolute inset-0 z-0 rounded-[0.7rem] bg-white/6"
          />
        </div>
      </ClientOnly>

      <div class="flex justify-end">
        <button
          type="button"
          class="text-xs font-medium text-white/48 transition-colors hover:text-white/72 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          @click="$emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const model = defineModel({
  type: String,
  default: "",
});

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  nonce: {
    type: Number,
    default: 0,
  },
  activeSlot: {
    type: String,
    default: "default",
  },
  slotName: {
    type: String,
    default: "default",
  },
  cancelLabel: {
    type: String,
    default: "取消",
  },
});

const isActive = computed(
  () => props.open && props.activeSlot === props.slotName
);

defineEmits(["cancel", "error"]);
</script>

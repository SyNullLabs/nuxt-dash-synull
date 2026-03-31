<template>
  <UModal :open="open" :dismissible="false">
    <template #content>
      <div class="space-y-4 p-6">
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-highlighted">
            {{ title }}
          </h3>
          <p class="text-sm text-muted">
            {{ description }}
          </p>
        </div>

        <ClientOnly>
          <div
            class="relative overflow-hidden rounded-[0.9rem] border border-default bg-default"
            style="height: 66px"
          >
            <NuxtTurnstile
              :key="nonce"
              v-model="model"
              class="absolute inset-0 z-10"
              :options="{ size: 'flexible' }"
              style="width: 100%; height: 64px"
              @error="$emit('error')"
            />
            <USkeleton
              v-if="!model"
              class="absolute inset-[1px] z-0 rounded-[0.82rem]"
            />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const model = defineModel({
  type: String,
  default: "",
});

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  nonce: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: "验证",
  },
  description: {
    type: String,
    default: "请完成人机验证",
  },
});

defineEmits(["error"]);
</script>


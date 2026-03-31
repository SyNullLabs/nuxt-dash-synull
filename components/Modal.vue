<template>
  <transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      >
        <div
          class="shell-overlay fixed inset-0 transition-opacity"
          aria-hidden="true"
          @click="$emit('close')"
        />

      <div
        class="dashboard-panel relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.75rem] transition-all"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),transparent_44%)]"
        />
        <div class="relative px-5 pt-6 pb-5 sm:px-6 sm:pb-6">
          <h3
            class="mb-8 flex items-center justify-center text-center text-lg font-semibold leading-6 tracking-[0.02em] text-[color:var(--ui-text)]"
            id="modal-title"
          >
            <Icon
              v-if="iconName"
              :name="iconName"
              class="mr-2 h-6 w-6 text-synull-200"
            />
            {{ title }}
          </h3>
          <div class="mt-2">
            <slot />
          </div>
        </div>
        <div
          class="relative flex flex-col gap-3 border-t border-[color:var(--ui-border)] bg-[var(--ui-bg-soft)] px-4 py-4 sm:flex-row-reverse sm:px-6"
        >
          <button
            v-if="showConfirm"
            @click="$emit('confirm')"
            type="button"
            class="inline-flex w-full justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_2px_rgb(255_255_255_/_0.4),inset_0_0_0_3px_rgb(7_7_10),inset_0_0_0_6px_var(--synull)] transition-colors hover:bg-white/92 focus:outline-none focus:ring-2 focus:ring-white/20 sm:ml-3 sm:w-auto"
          >
            {{ confirmTextComputed }}
          </button>
          <button
            @click="$emit('close')"
            type="button"
            class="inline-flex w-full justify-center rounded-full border border-[color:var(--ui-border)] bg-[var(--ui-bg-soft)] px-5 py-2.5 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[var(--synull-shell-hover)] hover:text-[color:var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-synull/30 sm:mt-0 sm:ml-3 sm:w-auto"
          >
            {{ cancelTextComputed }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const i18n = useI18n();

const props = defineProps({
  show: Boolean,
  title: String,
  showConfirm: {
    type: Boolean,
    default: true,
  },
  confirmText: {
    type: String,
    default: null,
  },
  cancelText: {
    type: String,
    default: null,
  },
  iconName: {
    type: String,
    default: "",
  },
});

const confirmTextComputed = computed(
  () => props.confirmText || i18n.t("confirm")
);
const cancelTextComputed = computed(() => props.cancelText || i18n.t("cancel"));

defineEmits(["close", "confirm"]);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

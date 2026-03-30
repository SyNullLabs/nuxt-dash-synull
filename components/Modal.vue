<template>
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center m-3"
      aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
        @click="$emit('close')"></div>

      <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-lg mx-auto">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-8 text-center flex items-center justify-center" id="modal-title">
            <Icon v-if="iconName" :name="iconName" class="text-gray-600 mr-2 w-6 h-6" />{{ title }}
          </h3>
          <div class="mt-2">
            <slot></slot>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button v-if="showConfirm" @click="$emit('confirm')" type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yunyoo text-base font-medium text-white hover:bg-yunyoo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yunyoo sm:ml-3 sm:w-auto sm:text-sm">
            {{ confirmTextComputed }}
          </button>
          <button @click="$emit('close')" type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yunyoo sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            {{ cancelTextComputed }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const i18n = useI18n()

const props = defineProps({
  show: Boolean,
  title: String,
  showConfirm: {
    type: Boolean,
    default: true
  },
  confirmText: {
    type: String,
    default: null
  },
  cancelText: {
    type: String,
    default: null
  },
  iconName: {
    type: String,
    default: ''
  }
})

const confirmTextComputed = computed(() => props.confirmText || i18n.t('confirm'))
const cancelTextComputed = computed(() => props.cancelText || i18n.t('cancel'))

defineEmits(['close', 'confirm'])
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
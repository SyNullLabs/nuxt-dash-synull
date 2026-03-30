<template>
    <transition name="slide-fade">
      <div v-if="show" :class="[ 
        'fixed top-5 left-1/2 transform -translate-x-1/2 p-3 text-center z-50',
        'transition-all duration-300 ease-in-out rounded-xl shadow-lg',
        'min-w-[200px] max-w-[80%] flex items-center',
        typeClasses
      ]" role="alert">
        <Icon :name="iconName" class="w-6 h-6 mr-2" />
        <span class="text-sm">{{ message }}</span>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { computed, watch, onMounted } from 'vue'
  import { useAlertStore } from '~/stores/alert'
  
  const alertStore = useAlertStore()
  
  const show = computed(() => alertStore.show)
  const message = computed(() => alertStore.message)
  const type = computed(() => alertStore.type)
  
  const typeClasses = computed(() => {
    switch (type.value) {
      case 'success':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      default:
        return 'bg-yunyoo-100 text-yunyoo-800 border border-yunyoo-200'
    }
  })
  
  const iconName = computed(() => {
    switch (type.value) {
      case 'success':
        return 'solar:smile-circle-bold-duotone'
      case 'error':
        return 'solar:confounded-circle-bold-duotone'
      case 'info':
        return 'solar:info-circle-bold-duotone'
      default:
        return 'solar:hashtag-circle-bold-duotone'
    }
  })
  
  watch(show, (newValue) => {
    console.log('AlertMessage show 值变化:', newValue)
  })
  
  watch(message, (newValue) => {
    console.log('AlertMessage message 值变化:', newValue)
  })
  
  onMounted(() => {
    console.log('AlertMessage 组件已挂载')
  })
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
<template>
  <aside
    v-show="!sidebarStore.isMobile || sidebarStore.isOpen"
    v-auto-animate
    :class="[
      'bg-white text-gray-700 h-screen transition-all duration-300 ease-in-out fixed top-16 left-0 z-20 backdrop-blur-sm flex flex-col justify-between',
      sidebarStore.isOpen ? 'w-64' : 'w-18',
      sidebarStore.isMobile && !sidebarStore.isOpen ? 'hidden' : ''
    ]"
  >
    <!-- 导航菜单 -->
    <nav class="m-2 flex-grow" v-auto-animate>
      <ul class="space-y-1">
        <li v-for="(item, index) in menuItems" :key="index" class="relative group">
          <NuxtLink
            @click="handleClick(item, index)"
            :to="item.href"
            :class="[
              'flex items-center justify-between py-4 hover:bg-yunyoo-100 hover:text-yunyoo-800 transition duration-300 ease-in-out rounded-xl',
              sidebarStore.currentRoute === item.href ? 'bg-yunyoo-100 text-yunyoo-800 font-semibold' : 'text-gray-700',
              sidebarStore.isOpen ? 'px-6' : 'px-4'
            ]"
          >
            <div class="flex items-center">
              <Icon :name="item.icon" class="w-5 h-5 flex-shrink-0 mr-3" />
              <span v-if="sidebarStore.isOpen" class="text-sm whitespace-nowrap">{{ $t(item.label) }}</span>
            </div>
            <div class="flex items-center">
              <Icon
                v-if="sidebarStore.isOpen && item.children"
              :name="sidebarStore.openSubmenus.includes(index) ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
              class="w-4 h-4 transition-transform duration-300"
              :class="{ 'transform rotate-180': sidebarStore.openSubmenus.includes(index) }"
              />
            </div>
          </NuxtLink>
          <!-- 二级菜单 -->
          <div v-if="item.children && sidebarStore.isOpen" 
               class="overflow-hidden transition-all duration-300 ease-in-out"
               :style="{ maxHeight: sidebarStore.openSubmenus.includes(index) ? `${item.children.length * 60}px` : '0px' }">
            <ul class="px-3 py-1 rounded space-y-1">
              <li v-for="(child, childIndex) in item.children" :key="childIndex">
                <NuxtLink
                  :to="child.href"
                  :class="[
                    'flex items-center p-2 pl-6 hover:bg-yunyoo-100 hover:text-yunyoo-800 transition duration-300 ease-in-out rounded-xl',
                    sidebarStore.currentRoute === child.href ? 'bg-yunyoo-100 text-yunyoo-800 font-semibold' : 'text-gray-700'
                  ]"
                >
                  <Icon :name="child.icon" class="w-5 h-5 flex-shrink-0 mr-3 opacity-80" />
                  <span class="text-sm whitespace-nowrap">{{ $t(child.label) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
          <!-- 悬停弹出窗口 -->
          <div
            v-if="!sidebarStore.isOpen && !sidebarStore.isMobile"
            class="absolute left-0 top-0 w-64 h-full bg-white shadow-lg rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform translate-x-[-100%] group-hover:translate-x-0 z-10"
          >
            <NuxtLink
              :to="item.href"
              class="flex items-center px-4 py-4"
              :class="sidebarStore.currentRoute === item.href ? 'bg-gray-100 text-gray-800 font-semibold' : 'text-gray-700'"
            >
              <span class="ml-16 text-sm">{{ $t(item.label) }}</span>
            </NuxtLink>
          </div>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidebarStore } from '~/stores/sidebar' // 引入 Pinia store

const sidebarStore = useSidebarStore() // 使用 Pinia store
const route = useRoute()
const router = useRouter()
const currentRoute = computed(() => route.path)

const menuItems = [
  { href: '/', icon: 'solar:home-2-bold-duotone', label: 'home' },
  { href: '/buy', icon: 'solar:cart-bold-duotone', label: 'buy' },
  { 
    href: 'javascript:void(0)', icon: 'solar:widget-2-bold-duotone', label: 'productManagement',
    children: [
      { href: '/products/cvm', icon: 'solar:cloud-bolt-minimalistic-line-duotone', label: 'cloudVirtualMachine' },
      { href: '/products/tcvm', icon: 'solar:cloud-storm-line-duotone', label: 'trafficCloudVirtualMachine' },
      { href: '/products/host', icon: 'solar:global-line-duotone', label: 'virtualHosts' }
    ]
  },
  // 添加更多菜单项...
]

const openSubmenus = ref([])

const toggleSubmenu = (index) => {
  const position = openSubmenus.value.indexOf(index)
  if (position > -1) {
    openSubmenus.value.splice(position, 1)
  } else {
    openSubmenus.value.push(index)
  }
}

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024 // 假设小于 1024px 为移动端
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const handleClick = (item, index) => {
  if (item.children) {
    sidebarStore.toggleSubmenu(index)
  } else {
    // 使用路由进行导航
    router.push(item.href)
  }
}

watch(() => route.path, (newPath) => {
  sidebarStore.setCurrentRoute(newPath)
})

onMounted(() => {
  sidebarStore.setCurrentRoute(route.path)
})
</script>

<style scoped>
aside {
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: 20;
}

.group:hover .absolute {
  opacity: 1;
  visibility: visible;
}

.absolute {
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  z-index: -10;
}

.overflow-hidden {
  transition: max-height 0.3s ease-in-out;
}

/* 添加新的动画样式 */
.group {
  perspective: 1000px;
}

.group:hover .absolute {
  animation: popOut 0.3s ease-out forwards;
}

@keyframes popOut {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
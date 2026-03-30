<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div class="bg-gray-75 min-h-screen">
      <TopBar v-model="sidebarStore.isOpen" />
      <Sidebar v-model="sidebarStore.isOpen" />
      <main :class="[
        'pt-20 pr-4 pb-4',
        sidebarStore.isMobile ? 'pl-4' : [
          'transition-all duration-300 ease-in-out',
          sidebarStore.isOpen ? 'pl-69' : 'pl-23'
        ]
      ]">
        <NuxtPage />
      </main>
      <!-- 移动端遮罩 -->
      <div v-if="sidebarStore.isOpen && sidebarStore.isMobile" class="fixed inset-0 bg-black bg-opacity-50 z-10"
        @click="sidebarStore.setIsOpen(false)"></div>
      <AlertMessage />
    </div>
  </n-config-provider>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import TopBar from '~/components/TopBar.vue'
import Sidebar from '~/components/Sidebar.vue'
import { useI18n } from 'vue-i18n'
import AlertMessage from '~/components/AlertMessage.vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '~/stores/alert'
import { useSidebarStore } from '~/stores/sidebar' // 引入 Pinia store
import { useAffStore } from '~/stores/aff'

const sidebarStore = useSidebarStore() // 使用 Pinia 
const isMobile = ref(false)
const { locale } = useI18n()
const router = useRouter()
const alertStore = useAlertStore()
const handleResize = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 1024
    sidebarStore.setIsMobile(isMobile.value) // 使用 store 中的状态
  }
}

const checkLoginStatus = async () => {
  const token = localStorage.getItem('jwt')
  if (!token) {
    alertStore.showAlert('请先登录', 'error')
    router.push({ path: '/auth/login', query: { redirect_uri: router.currentRoute.value.fullPath } })
    return
  }

  try {
    const response = await fetch('/api/dash/UserInfo', {
      method: 'GET',
      headers: {
        'Authorization': `${token}`
      }
    })
    const data = await response.json()

    if (data.success === false) {
      alertStore.showAlert(data.message || '请先登录', 'error')
      router.push({ path: '/auth/login', query: { redirect_uri: router.currentRoute.value.fullPath } })
    }
  } catch (error) {
    console.error('Error checking login status:', error)
    alertStore.showAlert('无法验证登录状态，请稍后再试', 'error')
  }
}

const themeOverrides = {
  common: {
    primaryColor: "#b074d1",
    primaryColorHover: "#b074d1",
    primaryColorPressed: "#b074d1",
    primaryColorSuppl: "#b074d1",
  },
  Tabs: {
    tabTextColorActiveBar: '#b074d1',
    barColor: '#b074d1',
    tabTextColorActive: '#b074d1',
    tabTextColor: '#b074d1',
  },
  Select: {
    peers: {
      InternalSelection: {
        textColor: '#b074d1',
        borderRadius: '0.5rem',
        border: '1px solid rgba(177, 116, 209, 0.2)',
        peers: {
          Tag: {
            borderRadius: '0.5rem',
            padding: '0.5rem',
          },
          Popover: {
            fontSize: '102px',
          }
        }
      },
      InternalSelectMenu: {
        borderRadius: '0.5rem',
        padding: '0.5rem'
      },
    }
  },
  DataTable: {
    peers: {
      Empty: {
        textColor: '#ccc'
      },
      Pagination: {
        itemTextColor: '#ccc'
      }
    }
  }
}

onMounted(() => {
  useAffStore()
  checkLoginStatus()
  handleResize()
  window.addEventListener('resize', handleResize)
  const savedLocale = document.cookie.replace(/(?:(?:^|.*;\s*)i18n_redirected\s*=\s*([^;]*).*$)|^.*$/, "$1")
  console.log('Saved locale:', savedLocale) // 调试信息
  if (savedLocale && ['zh', 'en'].includes(savedLocale)) {
    locale.value = savedLocale
    console.log('Setting locale to:', locale.value) // 调试信息
  } else {
    console.log('Using default locale:', locale.value) // 调试信息
  }
})

// 添加 watch 来监控 locale 的变化
watch(locale, (newLocale) => {
  console.log('Locale changed to:', newLocale) // 调试信息
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
})
</script>
<style>
.n-base-selection-tags {
  display: flex;
  align-items: center;
  padding: 5px 35px 5px 5px !important;
}

.n-base-selection-tag-wrapper {
  padding: 0 4px 0 0;
}

.n-base-selection .n-base-selection-tags {
  min-height: 38px !important;
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow: hidden !important;
  position: unset !important;
  overflow-x: scroll !important;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

.n-base-selection .n-base-selection-tags::-webkit-scrollbar {
  display: none !important;
}

.n-base-selection .n-base-suffix {
  right: 0 !important;
  width: 35px !important;
  height: 100% !important;
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 20%);
  border-radius: 0.5rem !important;
}

.n-tag.n-tag--closable {
  border-radius: 0.25rem !important;
}
</style>
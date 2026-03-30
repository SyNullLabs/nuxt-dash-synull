<template>
  <div class="relative">
    <!-- 毛玻璃背景容器 -->
    <div 
      class="fixed top-0 left-0 right-0 h-16 backdrop-blur-md z-20"
      :class="[
        modelValue ? 'bg-white' : 'bg-white/85',
        { 'lg:bg-white/85': modelValue }
      ]"
    ></div>
    
    <!-- 主要内容 -->
    <header class="fixed top-0 left-0 right-0 z-30 flex items-center justify-between text-gray-700 h-16">
      <div class="flex items-center">
        <!-- Logo -->
        <div :class="[
          'h-full flex items-center justify-center transition-all duration-300 ease-in-out', 
          sidebarStore.isOpen && !sidebarStore.isMobile ? 'w-64' : 'w-18'
        ]">
          <img 
            :src="sidebarStore.isOpen && !sidebarStore.isMobile ? 'https://yunyoo.cc/static/yunyoo/logo/2.png' : 'https://yunyoo.cc/static/yunyoo/logo/yoo_120.png'" 
            alt="YUNYOO Logo" 
            :class="[ 
              'transition-all duration-300 ease-in-out', 
              sidebarStore.isOpen && !sidebarStore.isMobile ? 'h-16 w-auto' : 'h-8 w-auto'
            ]"
          />
        </div>
        <button
          class="p-4 text-gray-500 flex items-center justify-center"
          @click="toggleSidebar"
        >
          <Icon :name="sidebarIcon" class="h-8 w-8 text-gray-600" />
        </button>
        <button :disabled="loading"
          class="p-4 text-gray-500 flex items-center justify-center"
          @click="refreshAll"
        >
          <Icon v-if="loading" name="solar:refresh-circle-bold-duotone" class="h-8 w-8 text-gray-300 motion-safe:animate-spin rotate-180" /> 
          <Icon v-else name="solar:refresh-square-line-duotone" class="h-8 w-8 text-gray-600" />
        </button>
        <div class="text-lg font-semibold hidden lg:block ml-4">
          {{ $t('dashboard') }}
        </div>
      </div>
      <div class="flex items-center space-x-4 ml-auto mr-4">
        <button @click="openLanguageModal" class="p-2 rounded-md hover:bg-gray-100 transition duration-300 flex items-center justify-center">
          <Icon name="tabler:language" class="w-6 h-6 text-gray-600" />
        </button>
        <span class="hidden sm:inline">{{ $t('welcome') }} {{ userInfo?.user?.username || '' }}</span>
        <div class="relative">
          <Skeleton v-if="loading" width="32px" height="32px" borderRadius="50%" />
          <img 
            v-else-if="userInfo?.user?.email_md5"
            @click="toggleDropdown"
            :src="`https://cravatar.cn/avatar/${userInfo.user.email_md5}?d=https://cravatar.cn/wp-content/uploads/sites/9/2024/03/lgqsza1-2.png`" 
            alt="用户头像" 
            class="h-8 w-8 rounded-full cursor-pointer"
          />
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div v-if="showDropdown" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 z-50">
              <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-600 transition duration-300 hover:bg-yunyoo-100 hover:text-yunyoo-800">
                <Icon name="solar:user-circle-bold-duotone" class="w-5 h-5 mr-3" />
                <span>{{ $t('personalProfile') }}</span>
              </a>
              <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-600 transition duration-300 hover:bg-yunyoo-100 hover:text-yunyoo-800">
                <Icon name="solar:safe-square-bold-duotone" class="w-5 h-5 mr-3" />
                <span>{{ $t('securitySettings') }}</span>
              </a>
              <a href="#" @click.prevent="logout" class="flex items-center px-4 py-3 text-sm text-red-600 transition duration-300 hover:bg-yunyoo-100 hover:text-yunyoo-800">
                <Icon name="solar:logout-3-bold-duotone" class="w-5 h-5 mr-3" />
                <span>{{ $t('logout') }}</span>
              </a>
            </div>
          </transition>
        </div>
      </div>

      <Modal 
        :show="showLanguageModal" 
        :title="$t('selectLanguage')" 
        :iconName="'tabler:language'"
        @close="showLanguageModal = false" 
        @confirm="changeLanguage"
        :confirmText="$t('confirm')"
        :cancelText="$t('cancel')"
      >
        <div class="flex flex-col space-y-2">
          <label 
            v-for="lang in availableLanguages" 
            :key="lang.code"
            class="flex items-center p-2 rounded-md transition duration-300 w-48 cursor-pointer"
            :class="selectedLanguage === lang.code ? 'bg-yunyoo-100 text-yunyoo-700' : 'hover:bg-gray-100'"
          >
            <input 
              type="radio" 
              :value="lang.code" 
              v-model="selectedLanguage" 
              class="mr-2 custom-radio"
            />
            <Twemoji :emoji="lang.flag" class="mr-2" />
            {{ lang.name }}
          </label>
        </div>
      </Modal>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from './Modal.vue'
import { useSidebarStore } from '~/stores/sidebar'
import { useRouter } from 'vue-router'

const sidebarStore = useSidebarStore()

const userInfoStore = ref(null)
const userInfo = ref(null)
const loading = ref(true)

// 在组件挂载时获取用户信息
onMounted(async () => {
  
  // 异步导入 userInfoStore
  const { useUserInfoStore } = await import('~/stores/userInfo')
  userInfoStore.value = useUserInfoStore()

  setTimeout(async () => {
    await userInfoStore.value.fetchUserInfo()
    userInfo.value = userInfoStore.value.userInfo
    loading.value = userInfoStore.value.loading
  }, 100)
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const toggleSidebar = () => {
  sidebarStore.setIsOpen(!sidebarStore.isOpen)
}

const sidebarIcon = computed(() => sidebarStore.isOpen ? 'solar:send-square-line-duotone' : 'solar:hamburger-menu-line-duotone')

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
}

const { locale, t } = useI18n()

const showLanguageModal = ref(false)
const selectedLanguage = ref(locale.value)

const openLanguageModal = () => {
  showLanguageModal.value = true
}

const availableLanguages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
]

const changeLanguage = () => {
  locale.value = selectedLanguage.value
  showLanguageModal.value = false
  // 添加以下行来设置cookie
  document.cookie = `i18n_redirected=${selectedLanguage.value}; max-age=31536000; path=/`
}

const toggleLanguage = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
}

const showModal = ref(false)

const handleConfirm = () => {
  console.log('确认按钮被点击')
  showModal.value = false
}

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024 // 假设小于 1024px 为移动端
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('click', closeDropdown)
})

const refreshAll = async () => {
  loading.value = true
  try {
    await refreshNuxtData()
  } finally {
    loading.value = false
  }
}

const preloadImages = () => {
  const images = [
    'https://yunyoo.cc/static/yunyoo/logo/2.png',
    'https://yunyoo.cc/static/yunyoo/logo/yoo_120.png'
  ]

  images.forEach(src => {
    const img = new Image()
    img.src = src
  })
}

onMounted(() => {
  preloadImages()
})

const logout = () => {
  localStorage.removeItem('jwt')
  window.location.href = '/auth/login?redirect_uri=' + router.currentRoute.value.fullPath
}

const router = useRouter()

</script>

<style scoped>
.custom-radio {
  appearance: none;
  width: 0.75rem;
  height: 0.75rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 50%;
  transition: background-color 0.3s, border-color 0.3s;
  cursor: pointer;
}

.custom-radio:checked {
  background-color: #b074d1; /* yunyoo */
  border-color: #b074d1; /* yunyoo */
}

.custom-radio:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(177, 116, 209, 0.5); /* yunyoo with opacity */
}

/* 可以添加以下样式来确保模态框显示在顶部 */
:deep(.modal-overlay) {
  z-index: 100;
}
</style>

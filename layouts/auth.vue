<template>
  <div class="auth-layout min-h-screen bg-gray-100 flex flex-col items-center justify-center bg-yunyoo-100 relative p-3">
    <!-- 添加 AlertMessage 组件 -->
    <AlertMessage />

    <!-- 主要内容 -->
    <slot />

    <!-- 语言切换按钮和下拉菜单 -->
    <n-dropdown 
      :options="languageItems" 
      @select="handleLanguageSelect"
      trigger="click"
      :show="showDropdown"
      @clickoutside="showDropdown = false"
      class="rounded-xl p-16"
    >
      <n-button 
        @click="showLanguageSelect"
        quaternary
        circle
        class="transition duration-300 ease-in-out w-10 h-10 flex items-center justify-center" 
      >
        <Icon name="tabler:language" class="text-xl" :class="loading ? 'text-gray-300 mt-2' : 'text-gray-400 hover:text-gray-500 active:text-yunyoo transition duration-300 ease-in-out'" />
      </n-button>
    </n-dropdown>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NDropdown, NSkeleton } from 'naive-ui'
import AlertMessage from '~/components/AlertMessage.vue'
import { useAffStore } from '~/stores/aff'

const loading = ref(true)
useAffStore()

const { locale, t } = useI18n()
const showDropdown = ref(false)

const availableLanguages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
]

const languageItems = computed(() => availableLanguages.map(lang => ({
  key: lang.code,
  label: () => h('div', { class: 'flex items-center gap-2' }, [
    h('span', {}, lang.flag),
    h('span', {}, lang.name)
  ])
})))

const showLanguageSelect = () => {
  showDropdown.value = true
}

const handleLanguageSelect = (key) => {
  changeLanguage(key)
  showDropdown.value = false
}

const changeLanguage = (langCode) => {
  locale.value = langCode
  document.cookie = `i18n_redirected=${langCode}; max-age=31536000; path=/`
}

onMounted(() => {
  loading.value = false
})

</script>


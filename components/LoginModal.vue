<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">{{ $t('login') }}</h2>
        <form @submit.prevent="handleLoginClick">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm mb-2" for="email">{{ $t('email') }}</label>
            <input
              class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email" type="email" v-model="email" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm mb-2" for="password">{{ $t('password') }}</label>
            <input
              class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password" type="password" v-model="password" required>
          </div>
          <div class="flex items-center justify-between">
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit">
              {{ $t('loginButton') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '~/stores/auth'
  import { useAlertStore } from '~/stores/alert'
  import { useI18n } from 'vue-i18n'
  
  const { t } = useI18n()
  const router = useRouter()
  const authStore = useAuthStore()
  const alertStore = useAlertStore()
  
  const email = ref('')
  const password = ref('')
  
  const handleLoginClick = async () => {
    try {
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: email.value,
          password: password.value
        }
      })
  
      if (error.value) {
        throw error.value
      }
  
      const response = data.value
  
      if (response.success) {
        authStore.setToken(response.jwt)
        localStorage.setItem('jwt', response.jwt)
        alertStore.showAlert(t('loginSuccess'), 'success')
        router.push('/dashboard')
        $emit('close') // 关闭弹窗
      } else {
        alertStore.showAlert(t('loginFailed') + (response.message || t('unknownError')), 'error')
      }
    } catch (error) {
      alertStore.showAlert(t('loginError'), 'error')
    }
  }
  </script>
  
  <style scoped>
  /* 可根据需要添加自定义样式 */
  </style>
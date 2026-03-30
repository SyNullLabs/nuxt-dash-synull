<template>
  <div class="w-full max-w-md m-3">
    <div class="bg-white shadow-xl rounded-lg overflow-hidden">
      <div class="h-2 bg-synull"></div>
      <div class="px-12 py-12 pb-10">
        <h2 class="text-3xl text-gray-700 mb-6 text-synull">
          {{ $t("login") }}
        </h2>
        <form @submit.prevent="handleLoginClick">
          <div class="mb-6">
            <label class="block text-gray-400 text-sm mb-2" for="email">
              {{ $t("email") }}
            </label>
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center p-2.5 bg-synull-200 rounded-l-lg border-r border-synull"
              >
                <Icon
                  name="solar:mention-circle-line-duotone"
                  class="text-gray-700 w-5 h-5"
                />
              </span>
              <input
                class="appearance-none border rounded-lg w-full py-2.5 pl-12 pr-3 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-synull bg-white"
                id="email"
                type="email"
                :placeholder="$t('enterEmail')"
                v-model.lazy="email"
                autocomplete="email"
              />
            </div>
          </div>
          <div class="mb-6">
            <label class="block text-gray-400 text-sm mb-2" for="password">
              {{ $t("password") }}
            </label>
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center p-2.5 bg-synull-200 rounded-l-lg border-r border-synull"
              >
                <Icon
                  name="solar:key-bold-duotone"
                  class="text-gray-700 w-5 h-5"
                />
              </span>
              <input
                class="appearance-none border rounded-lg w-full py-2.5 pl-12 pr-3 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-synull bg-white"
                id="password"
                type="password"
                :placeholder="$t('enterPassword')"
                v-model.lazy="password"
                autocomplete="current-password"
              />
            </div>
          </div>
          <div class="flex items-center justify-between mb-6">
            <a
              class="inline-block align-baseline font-bold text-sm text-synull hover:text-synull-800 text-xs"
              href="/auth/register"
            >
              {{ $t("register") }}
            </a>
            <a
              class="inline-block align-baseline font-bold text-sm text-synull hover:text-synull-800 text-xs"
              href="/auth/reset"
            >
              {{ $t("forgotPassword") }}
            </a>
          </div>
          <div class="">
            <div v-if="showTurnstile" class="">
              <ClientOnly>
                <div class="relative" style="height: 65px">
                  <NuxtTurnstile
                    class="absolute z-10"
                    v-model="turnstileToken"
                    @error="handleTurnstileError"
                    :options="{ size: 'flexible' }"
                    style="width: calc(100% - 1px); height: 64px"
                  />
                  <USkeleton
                    v-if="!turnstileToken"
                    class="absolute left-0 z-0 rounded-lg"
                    style="width: calc(100% - 1px); height: 64px"
                  />
                </div>
              </ClientOnly>
            </div>
            <button
              v-if="!isVerifying"
              class="bg-synull hover:bg-synull-900 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full text-sm text-bold flex items-center justify-center"
              type="submit"
              :disabled="isLoading"
            >
              <template v-if="isLoading">
                <Icon name="eos-icons:loading" class="animate-spin mr-1" />
                {{ $t("loading") }}
              </template>
              <template v-else>
                {{ $t("loginButton") }}
              </template>
            </button>
          </div>
        </form>
      </div>
      <div class="px-6 py-1 flex justify-center">
        <a href="/" class="text-sm text-synull hover:text-synull-800 text-xs">
          SYNULL
        </a>
      </div>
      <div class="h-2 bg-synull"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAlertStore } from "~/stores/alert";
import { useAuthStore } from "~/stores/auth";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const alertStore = useAlertStore();
const api = useApiClient();

const email = ref("");
const password = ref("");
const turnstileToken = ref("");
const showTurnstile = ref(false);
const isLoading = ref(false);
const isVerifying = ref(false);

definePageMeta({
  layout: "auth",
});

const handleTurnstileError = () => {
  alertStore.showAlert(t("turnstileError"), "error");
};

// 监听 turnstileToken 的变化
watch(turnstileToken, async (newToken) => {
  if (newToken && email.value && password.value) {
    await handleLogin();
  }
});

const handleLoginClick = async () => {
  if (!email.value || !password.value) {
    alertStore.showAlert(t("pleaseEnterCredentials"), "error");
    return;
  }

  isVerifying.value = true;
  showTurnstile.value = true;
  alertStore.showAlert(t("pleaseCompleteVerification"), "info");
};

const handleLogin = async () => {
  try {
    isLoading.value = true;
    alertStore.showAlert(t("loggingIn"), "info");

    const response = await api("/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
        turnstileToken: turnstileToken.value,
      },
    });

    if (response.success) {
      authStore.setToken(response.jwt);
      setAuthToken(response.jwt);
      alertStore.showAlert(t("loginSuccess"), "success");

      const redirectUri =
        new URLSearchParams(window.location.search).get("redirect_uri") || "/";
      router.push(redirectUri);
    } else if (response.secondVerify) {
      handleSecondVerification(response.secondVerify);
    } else {
      alertStore.showAlert(
        t("loginFailed") + (response.message || t("unknownError")),
        "error"
      );
      resetTurnstile();
    }
  } catch (error) {
    alertStore.showAlert(
      error?.data?.message || error?.statusMessage || t("loginError"),
      "error"
    );
    resetTurnstile();
  } finally {
    isLoading.value = false;
    isVerifying.value = false;
  }
};

const handleSecondVerification = () => {
  // 实现二次验证逻辑
};

const resetTurnstile = () => {
  turnstileToken.value = "";
  showTurnstile.value = false;
  isVerifying.value = false;
  setTimeout(() => {
    showTurnstile.value = true;
  }, 250); // 短暂延迟以确保 Turnstile 组件重新渲染
};

onMounted(() => {
  isLoading.value = false;
});
</script>

<style scoped>
/* 你的样式保持不变 */
</style>

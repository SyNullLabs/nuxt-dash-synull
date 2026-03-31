<template>
  <div class="w-full max-w-[20rem] sm:max-w-[22rem]">
    <div class="space-y-8">
      <div class="space-y-2">
        <h1
          class="text-[2.2rem] font-semibold tracking-[-0.06em] text-white/92 sm:text-[2.45rem]"
        >
          {{ $t("welcomeBack") }}
        </h1>
        <p class="text-sm text-white/45">
          {{ $t("signInToAccount") }}
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleLoginClick">
        <div class="space-y-2.5">
          <label class="block text-sm font-medium text-white/72" for="email">
            {{ $t("email") }}
          </label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
          />
        </div>

        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-4">
            <label
              class="block text-sm font-medium text-white/72"
              for="password"
            >
              {{ $t("password") }}
            </label>
            <NuxtLink
              to="/auth/reset"
              class="text-sm text-white/56 transition-colors hover:text-white"
            >
              {{ $t("forgotPassword") }}
            </NuxtLink>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
          />
        </div>

        <div v-if="showTurnstile" class="space-y-2">
          <p class="text-xs text-white/45">
            {{ isLoading ? $t("loggingIn") : $t("completeVerification") }}
          </p>
          <ClientOnly>
            <div
              class="relative overflow-hidden rounded-[0.9rem] border border-white/10 bg-white/6"
              style="height: 66px"
            >
              <NuxtTurnstile
                class="absolute inset-0 z-10"
                v-model="turnstileToken"
                @error="handleTurnstileError"
                :options="{ size: 'flexible' }"
                style="width: 100%; height: 64px"
              />
              <USkeleton
                v-if="!turnstileToken"
                class="absolute inset-[1px] z-0 rounded-[0.82rem]"
              />
            </div>
          </ClientOnly>
        </div>

        <button
          v-if="!showTurnstile"
          class="auth-primary-button flex h-11 w-full items-center justify-center rounded-[0.7rem] px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          :disabled="isLoading"
        >
          {{ $t("loginButton") }}
        </button>
      </form>

      <p class="text-center text-sm text-white/48">
        {{ $t("dontHaveAccount") }}
        <NuxtLink
          to="/auth/register"
          class="font-semibold text-white underline underline-offset-4 transition-colors hover:text-white/72"
        >
          {{ $t("signUpNow") }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
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

definePageMeta({
  layout: "auth",
});

const handleTurnstileError = () => {
  alertStore.showAlert(t("turnstileError"), "error");
};

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

  showTurnstile.value = true;
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
  }
};

const handleSecondVerification = () => {
  // 实现二次验证逻辑
};

const resetTurnstile = () => {
  turnstileToken.value = "";
  showTurnstile.value = false;
  setTimeout(() => {
    showTurnstile.value = true;
  }, 250);
};
</script>

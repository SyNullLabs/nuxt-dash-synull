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

      <form class="space-y-5" @submit.prevent="handleLogin">
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

        <TurnstileInlinePanel
          v-model="loginTurnstileToken"
          :open="isLoginTurnstileOpen"
          :nonce="loginTurnstileNonce"
          :active-slot="loginTurnstileActiveSlot"
          slot-name="submit"
          :title="$t('verify')"
          :description="$t('completeVerification')"
          :cancel-label="$t('cancel')"
          @cancel="loginTurnstile.cancel()"
          @error="handleTurnstileError"
        >
          <button
            class="auth-primary-button flex h-11 w-full items-center justify-center rounded-[0.7rem] px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            :disabled="isLoading"
            @click.prevent="handleLogin"
          >
            {{ isLoading ? $t("loggingIn") : $t("loginButton") }}
          </button>
        </TurnstileInlinePanel>
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { normalizeAuthRedirectUri } from "~/composables/useSession";
import { useTurnstileChallenge } from "~/composables/useTurnstileChallenge";
import { useAlertStore } from "~/stores/alert";
import { useAuthStore } from "~/stores/auth";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const alertStore = useAlertStore();
const api = useApiClient();
const loginTurnstile = useTurnstileChallenge();
const {
  token: loginTurnstileToken,
  isOpen: isLoginTurnstileOpen,
  nonce: loginTurnstileNonce,
  activeSlot: loginTurnstileActiveSlot,
} = loginTurnstile;

const email = ref("");
const password = ref("");
const isLoading = ref(false);

definePageMeta({
  layout: "auth",
});

const handleTurnstileError = () => {
  alertStore.showAlert(t("turnstileError"), "error");
};

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alertStore.showAlert(t("pleaseEnterCredentials"), "error");
    return;
  }

  let turnstileToken = "";

  try {
    turnstileToken = await loginTurnstile.ensureToken("submit");
  } catch {
    return;
  }

  try {
    isLoading.value = true;
    alertStore.showAlert(t("loggingIn"), "info");

    const response = await api("/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
        turnstileToken,
      },
    });

    if (response.success) {
      authStore.setToken(response.jwt);
      setAuthToken(response.jwt);
      alertStore.showAlert(t("loginSuccess"), "success");

      const redirectUri = normalizeAuthRedirectUri(
        new URLSearchParams(window.location.search).get("redirect_uri")
      );
      router.push(redirectUri);
    } else if (response.secondVerify) {
      handleSecondVerification(response.secondVerify);
    } else {
      alertStore.showAlert(
        t("loginFailed") + (response.message || t("unknownError")),
        "error"
      );
    }
  } catch (error) {
    alertStore.showAlert(
      error?.data?.message || error?.statusMessage || t("loginError"),
      "error"
    );
  } finally {
    isLoading.value = false;
    loginTurnstile.reset();
  }
};

const handleSecondVerification = () => {
  // 实现二次验证逻辑
};
</script>

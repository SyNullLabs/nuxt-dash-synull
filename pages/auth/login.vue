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

        <div
          v-if="secondVerify.required"
          class="space-y-3 rounded-[0.95rem] border border-white/10 bg-white/4 p-3.5"
        >
          <div class="space-y-1">
            <p class="text-sm font-medium text-white/72">
              {{ $t("secondVerify") }}
            </p>
            <p class="text-xs text-white/45">
              {{ secondVerifyHint }}
            </p>
          </div>

          <div
            v-if="secondVerifyMethods.length > 1"
            class="grid grid-cols-2 gap-2 rounded-[0.75rem] bg-white/6 p-1"
          >
            <button
              v-for="method in secondVerifyMethods"
              :key="method.value"
              type="button"
              class="rounded-[0.65rem] px-3 py-2 text-sm font-medium transition-colors"
              :class="
                secondVerify.selectedType === method.value
                  ? 'bg-white text-[#14151a]'
                  : 'text-white/58 hover:text-white'
              "
              @click="selectSecondVerifyMethod(method.value)"
            >
              {{ method.label }}
            </button>
          </div>

          <div class="space-y-2.5">
            <label
              class="block text-sm font-medium text-white/72"
              for="login-code"
            >
              {{ $t("verificationCode") }}
            </label>
            <div class="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
              <input
                id="login-code"
                v-model.trim="verificationCode"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                :placeholder="$t('enterVerificationCode')"
                class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
              />
              <button
                type="button"
                class="h-11 rounded-[0.7rem] border border-white/10 bg-white/6 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
                :disabled="
                  isLoading ||
                  secondVerifySender.isSending.value ||
                  secondVerifySender.secondsLeft.value > 0
                "
                @click="handleSendSecondVerifyCode"
              >
                {{ secondVerifySendLabel }}
              </button>
            </div>
          </div>
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
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { normalizeAuthRedirectUri } from "~/composables/useSession";
import { useTurnstileChallenge } from "~/composables/useTurnstileChallenge";
import { useVerificationCode } from "~/composables/useVerificationCode";
import { useAlertStore } from "~/stores/alert";
import { useAuthStore } from "~/stores/auth";

const { t } = useI18n();
const route = useRoute();
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
const verificationCode = ref("");
const isLoading = ref(false);
const secondVerifySender = useVerificationCode();

const createSecondVerifyState = () => ({
  required: false,
  methods: [],
  selectedType: "email",
  action: "login",
  recipients: {
    email: "",
    phone: "",
  },
});

const secondVerify = ref(createSecondVerifyState());

definePageMeta({
  layout: "auth",
});

const secondVerifyMethods = computed(() =>
  (secondVerify.value.methods || []).map((method) => ({
    value: method,
    label: t(method === "phone" ? "phoneMode" : "emailMode"),
  }))
);
const secondVerifyTarget = computed(
  () => secondVerify.value.recipients?.[secondVerify.value.selectedType] || ""
);
const secondVerifyHint = computed(() => {
  if (secondVerifyTarget.value) {
    return secondVerifyTarget.value;
  }

  return (
    secondVerifyMethods.value.find(
      ({ value }) => value === secondVerify.value.selectedType
    )?.label || t("secondVerify")
  );
});
const secondVerifySendLabel = computed(() => {
  if (secondVerifySender.isSending.value) {
    return t("sendingCode");
  }

  if (secondVerifySender.secondsLeft.value > 0) {
    return `${secondVerifySender.secondsLeft.value}s`;
  }

  return t("sendCode");
});

const handleTurnstileError = () => {
  alertStore.showAlert(t("turnstileError"), "error");
};

const resetSecondVerify = () => {
  verificationCode.value = "";
  secondVerifySender.reset();
  secondVerify.value = createSecondVerifyState();
};

const applySecondVerifyState = (payload = {}) => {
  const methods =
    Array.isArray(payload.methods) && payload.methods.length
      ? payload.methods
      : [payload.selectedType || "email"];
  const selectedType = methods.includes(payload.selectedType)
    ? payload.selectedType
    : methods[0];

  verificationCode.value = "";
  secondVerifySender.reset();
  secondVerify.value = {
    required: true,
    methods,
    selectedType,
    action:
      typeof payload.action === "string" && payload.action.trim()
        ? payload.action.trim()
        : "login",
    recipients: {
      email: payload.recipients?.email || "",
      phone: payload.recipients?.phone || "",
    },
  };
};

const selectSecondVerifyMethod = (method) => {
  if (!secondVerify.value.methods.includes(method)) {
    return;
  }

  verificationCode.value = "";
  secondVerifySender.reset();
  secondVerify.value.selectedType = method;
};

const handleSendSecondVerifyCode = async () => {
  if (!secondVerify.value.required) {
    return;
  }

  if (!email.value || !password.value) {
    alertStore.showAlert(t("pleaseEnterCredentials"), "error");
    return;
  }

  try {
    await secondVerifySender.send(async () => {
      const response = await api("/auth/login/second-verify/send", {
        method: "POST",
        body: {
          email: email.value,
          password: password.value,
          type: secondVerify.value.selectedType,
          action: secondVerify.value.action,
        },
      });

      if (!response?.success) {
        throw new Error(response?.message || t("sendCodeFailed"));
      }
    });

    alertStore.showAlert(t("codeSent"), "success");
  } catch (error) {
    alertStore.showAlert(
      error?.data?.message || error?.message || t("sendCodeFailed"),
      "error"
    );
  }
};

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alertStore.showAlert(t("pleaseEnterCredentials"), "error");
    return;
  }

  if (secondVerify.value.required && !verificationCode.value) {
    alertStore.showAlert(t("pleaseEnterVerificationCode"), "error");
    return;
  }

  const needsTurnstile = !secondVerify.value.required;
  let turnstileToken = "";

  if (needsTurnstile) {
    try {
      turnstileToken = await loginTurnstile.ensureToken("submit");
    } catch (error) {
      if (error?.message === "Turnstile challenge unavailable") {
        handleTurnstileError();
      }

      return;
    }
  }

  try {
    isLoading.value = true;
    alertStore.showAlert(
      secondVerify.value.required ? t("secondVerify") : t("loggingIn"),
      "info"
    );

    const response = await api("/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
        ...(needsTurnstile ? { turnstileToken } : {}),
        ...(secondVerify.value.required ? { code: verificationCode.value } : {}),
      },
    });

    if (response.success) {
      authStore.setToken(response.jwt);
      setAuthToken(response.jwt);
      alertStore.showAlert(t("loginSuccess"), "success");

      const redirectUri = normalizeAuthRedirectUri(route.query.redirect_uri);
      router.push(redirectUri);
      return;
    }

    if (response.secondVerify) {
      applySecondVerifyState(response.secondVerify);
      alertStore.showAlert(response.message || t("secondVerify"), "info");
      return;
    }

    alertStore.showAlert(
      t("loginFailed") + (response.message || t("unknownError")),
      "error"
    );
  } catch (error) {
    alertStore.showAlert(
      error?.data?.message || error?.statusMessage || t("loginError"),
      "error"
    );
  } finally {
    isLoading.value = false;

    if (needsTurnstile) {
      loginTurnstile.reset();
    }
  }
};

watch([email, password], ([nextEmail, nextPassword], [prevEmail, prevPassword]) => {
  if (
    secondVerify.value.required &&
    (nextEmail !== prevEmail || nextPassword !== prevPassword)
  ) {
    resetSecondVerify();
  }
});
</script>

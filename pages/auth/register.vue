<template>
  <div class="w-full max-w-[23rem]">
    <div class="space-y-8">
      <div class="space-y-2">
        <h1
          class="text-[2.05rem] font-semibold tracking-[-0.06em] text-white/92 sm:text-[2.3rem]"
        >
          {{ $t("registerTitle") }}
        </h1>
        <p class="text-sm text-white/45">
          {{ $t("registerSubtitle") }}
        </p>
      </div>

      <template v-if="hasRegisterMethods">
        <div
          v-if="registerModes.length > 1"
          class="grid grid-cols-2 gap-2 rounded-[0.8rem] bg-white/6 p-1"
        >
          <button
            v-for="mode in registerModes"
            :key="mode.value"
            type="button"
            class="rounded-[0.65rem] px-3 py-2 text-sm font-medium transition-colors"
            :class="
              activeMode === mode.value
                ? 'bg-white text-[#14151a]'
                : 'text-white/58 hover:text-white'
            "
            @click="activeMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <template v-if="activeMode === 'email'">
            <div class="space-y-2.5">
              <label
                class="block text-sm font-medium text-white/72"
                for="email"
              >
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
          </template>
          <template v-else>
            <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
              <div class="space-y-2.5">
                <label
                  class="block text-sm font-medium text-white/72"
                  for="phone-code"
                >
                  {{ $t("phoneCode") }}
                </label>
                <input
                  id="phone-code"
                  v-model.trim="phoneCode"
                  type="text"
                  inputmode="numeric"
                  autocomplete="tel-country-code"
                  placeholder="86"
                  class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
                />
              </div>
              <div class="space-y-2.5">
                <label
                  class="block text-sm font-medium text-white/72"
                  for="phone"
                >
                  {{ $t("phone") }}
                </label>
                <input
                  id="phone"
                  v-model.trim="phone"
                  type="text"
                  inputmode="tel"
                  autocomplete="tel-national"
                  placeholder="13800138000"
                  class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
                />
              </div>
            </div>
          </template>

          <div class="space-y-2.5">
            <label
              class="block text-sm font-medium text-white/72"
              for="register-code"
            >
              {{ $t("verificationCode") }}
            </label>
            <div class="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
              <input
                id="register-code"
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
                  activeSender.isSending.value ||
                  activeSender.secondsLeft.value > 0 ||
                  (isRegisterTurnstileOpen &&
                    registerTurnstileActiveSlot === 'send-code')
                "
                @click="handleSendCode"
              >
                {{ sendCodeLabel }}
              </button>
            </div>
            <TurnstileInlinePanel
              v-model="registerTurnstileToken"
              :open="isRegisterTurnstileOpen"
              :nonce="registerTurnstileNonce"
              :active-slot="registerTurnstileActiveSlot"
              slot-name="send-code"
              :cancel-label="$t('cancel')"
              @cancel="registerTurnstile.cancel()"
              @error="handleTurnstileError"
            >
              <div class="hidden"></div>
            </TurnstileInlinePanel>
          </div>

          <div class="space-y-2.5">
            <label
              class="block text-sm font-medium text-white/72"
              for="password"
            >
              {{ $t("password") }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('enterNewPassword')"
              class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
            />
          </div>

          <div class="space-y-2.5">
            <label
              class="block text-sm font-medium text-white/72"
              for="confirm-password"
            >
              {{ $t("confirmPassword") }}
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('enterConfirmPassword')"
              class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
            />
          </div>

          <div v-if="requiresCaptcha" class="space-y-2.5">
            <div class="flex items-center justify-between gap-4">
              <label
                class="block text-sm font-medium text-white/72"
                for="captcha"
              >
                {{ $t("captcha") }}
              </label>
              <button
                type="button"
                class="text-xs text-white/48 transition-colors hover:text-white"
                @click="refreshCaptcha"
              >
                {{ $t("refreshCaptcha") }}
              </button>
            </div>
            <div class="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
              <input
                id="captcha"
                v-model.trim="captcha"
                type="text"
                autocomplete="off"
                :placeholder="$t('enterCaptcha')"
                class="h-11 w-full appearance-none rounded-[0.7rem] border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder:text-white/28 focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
              />
              <button
                type="button"
                class="h-11 overflow-hidden rounded-[0.7rem] border border-white/10 bg-white/6"
                @click="refreshCaptcha"
              >
                <img
                  :src="captchaUrl"
                  :alt="$t('captcha')"
                  class="h-full w-full object-cover"
                />
              </button>
            </div>
          </div>

          <TurnstileInlinePanel
            v-model="registerTurnstileToken"
            :open="isRegisterTurnstileOpen"
            :nonce="registerTurnstileNonce"
            :active-slot="registerTurnstileActiveSlot"
            slot-name="submit"
            :title="$t('verify')"
            :description="$t('completeVerification')"
            :cancel-label="$t('cancel')"
            @cancel="registerTurnstile.cancel()"
            @error="handleTurnstileError"
          >
            <button
              class="auth-primary-button flex h-11 w-full items-center justify-center rounded-[0.7rem] px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              :disabled="isSubmitting"
              @click.prevent="handleRegister"
            >
              <template v-if="isSubmitting">
                <Icon name="eos-icons:loading" class="mr-1 animate-spin" />
                {{ $t("loading") }}
              </template>
              <template v-else>
                {{ $t("createAccount") }}
              </template>
            </button>
          </TurnstileInlinePanel>
        </form>
      </template>
      <p v-else class="text-sm text-white/48">
        {{ $t("registerUnavailable") }}
      </p>

      <p class="text-center text-sm text-white/48">
        {{ $t("alreadyHaveAccount") }}
        <NuxtLink
          to="/auth/login"
          class="font-semibold text-white underline underline-offset-4 transition-colors hover:text-white/72"
        >
          {{ $t("backToLogin") }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAffiliateReferral } from "~/composables/useAffiliateReferral";
import { useAuthMethods } from "~/composables/useAuthMethods";
import { useTurnstileChallenge } from "~/composables/useTurnstileChallenge";
import { useVerificationCode } from "~/composables/useVerificationCode";
import { useAlertStore } from "~/stores/alert";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const alertStore = useAlertStore();
const api = useApiClient();
const { affiliateRef, readAffiliateQuery } = useAffiliateReferral();
const { methods, loadAuthMethods } = useAuthMethods();
const registerTurnstile = useTurnstileChallenge();
const {
  token: registerTurnstileToken,
  isOpen: isRegisterTurnstileOpen,
  nonce: registerTurnstileNonce,
  activeSlot: registerTurnstileActiveSlot,
} = registerTurnstile;

const activeMode = ref("email");
const email = ref("");
const phoneCode = ref("86");
const phone = ref("");
const verificationCode = ref("");
const password = ref("");
const confirmPassword = ref("");
const captcha = ref("");
const captchaNonce = ref(0);
const isSubmitting = ref(false);

const emailSender = useVerificationCode();
const phoneSender = useVerificationCode();

definePageMeta({
  layout: "auth",
});

const saleId = computed(() => {
  return readAffiliateQuery(route.query) || affiliateRef.value || "";
});

const registerModes = computed(() => {
  if (!methods.value) {
    return [{ value: "email", label: t("emailMode") }];
  }

  const availableModes = [];

  if (methods.value.register?.email) {
    availableModes.push({ value: "email", label: t("emailMode") });
  }

  if (methods.value.register?.phone) {
    availableModes.push({ value: "phone", label: t("phoneMode") });
  }

  return availableModes;
});

const hasRegisterMethods = computed(
  () => !methods.value || registerModes.value.length > 0
);
const requiresCaptcha = computed(() => {
  if (!methods.value) {
    return true;
  }

  return activeMode.value === "email"
    ? !!methods.value.captcha?.register?.email
    : !!methods.value.captcha?.register?.phone;
});

const activeSender = computed(() =>
  activeMode.value === "email" ? emailSender : phoneSender
);

const sendCodeLabel = computed(() => {
  if (activeSender.value.isSending.value) {
    return t("sendingCode");
  }

  if (activeSender.value.secondsLeft.value > 0) {
    return `${activeSender.value.secondsLeft.value}s`;
  }

  return t("sendCode");
});

const captchaUrl = computed(
  () =>
    `/api/auth/captcha?name=${
      activeMode.value === "email"
        ? "allow_register_email_captcha"
        : "allow_register_phone_captcha"
    }&t=${captchaNonce.value}`
);

const refreshCaptcha = () => {
  captcha.value = "";
  captchaNonce.value = Date.now();
};

const handleTurnstileError = () => {
  alertStore.showAlert(t("turnstileError"), "error");
};

const isTurnstileCancelled = (error) =>
  error?.message === "Turnstile challenge cancelled";
const isTurnstileUnavailable = (error) =>
  error?.message === "Turnstile challenge unavailable";

const withTurnstile = async (handler, slot = "submit") => {
  const turnstileToken = await registerTurnstile.ensureToken(slot);

  try {
    return await handler(turnstileToken);
  } finally {
    registerTurnstile.reset();
  }
};

const validateSharedFields = () => {
  if (!verificationCode.value || !password.value || !confirmPassword.value) {
    alertStore.showAlert(t("pleaseCompleteRegisterInfo"), "error");
    return false;
  }

  if (requiresCaptcha.value && !captcha.value) {
    alertStore.showAlert(t("pleaseCompleteRegisterInfo"), "error");
    return false;
  }

  if (password.value !== confirmPassword.value) {
    alertStore.showAlert(t("passwordsDoNotMatch"), "error");
    return false;
  }

  return true;
};

const handleSendCode = async () => {
  if (activeMode.value === "email" && !email.value) {
    alertStore.showAlert(t("pleaseEnterEmail"), "error");
    return;
  }

  if (activeMode.value === "phone" && (!phoneCode.value || !phone.value)) {
    alertStore.showAlert(t("pleaseEnterPhone"), "error");
    return;
  }

  try {
    await activeSender.value.send(() =>
      withTurnstile(async (turnstileToken) => {
        if (activeMode.value === "email") {
          const response = await api("/auth/register/email/send", {
            method: "POST",
            body: {
              email: email.value,
              turnstileToken,
            },
          });

          if (!response.success) {
            throw new Error(response.message || t("sendCodeFailed"));
          }

          alertStore.showAlert(response.message || t("codeSent"), "success");
          return;
        }

        const response = await api("/auth/register/phone/send", {
          method: "POST",
          body: {
            phoneCode: phoneCode.value,
            phone: phone.value,
            turnstileToken,
          },
        });

        if (!response.success) {
          throw new Error(response.message || t("sendCodeFailed"));
        }

        alertStore.showAlert(response.message || t("codeSent"), "success");
      }, "send-code")
    );
  } catch (error) {
    if (isTurnstileCancelled(error)) {
      return;
    }

    if (isTurnstileUnavailable(error)) {
      handleTurnstileError();
      return;
    }

    alertStore.showAlert(error?.message || t("sendCodeFailed"), "error");
  }
};

const handleRegister = async () => {
  if (activeMode.value === "email" && !email.value) {
    alertStore.showAlert(t("pleaseEnterEmail"), "error");
    return;
  }

  if (activeMode.value === "phone" && (!phoneCode.value || !phone.value)) {
    alertStore.showAlert(t("pleaseEnterPhone"), "error");
    return;
  }

  if (!validateSharedFields()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await withTurnstile((turnstileToken) =>
      api(
        activeMode.value === "email"
          ? "/auth/register/email"
          : "/auth/register/phone",
        {
          method: "POST",
          body: {
            email: email.value,
            phoneCode: phoneCode.value,
            phone: phone.value,
            password: password.value,
            code: verificationCode.value,
            saleId: saleId.value,
            turnstileToken,
            ...(requiresCaptcha.value ? { captcha: captcha.value } : {}),
          },
        }
      )
    );

    if (!response.success) {
      alertStore.showAlert(response.message || t("registerFailed"), "error");
      if (requiresCaptcha.value) {
        refreshCaptcha();
      }
      return;
    }

    alertStore.showAlert(
      response.message || t("registerSuccessMsg"),
      "success"
    );
    await router.push("/auth/login");
  } catch (error) {
    if (isTurnstileCancelled(error)) {
      return;
    }

    if (isTurnstileUnavailable(error)) {
      handleTurnstileError();
      return;
    }

    alertStore.showAlert(error?.message || t("registerFailed"), "error");
    if (requiresCaptcha.value) {
      refreshCaptcha();
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  refreshCaptcha();
  loadAuthMethods();
});

watch(
  registerModes,
  (nextModes) => {
    if (!nextModes.some((mode) => mode.value === activeMode.value)) {
      activeMode.value = nextModes[0]?.value || "email";
    }
  },
  { immediate: true }
);

watch(activeMode, () => {
  verificationCode.value = "";
  captcha.value = "";
  refreshCaptcha();
});
</script>

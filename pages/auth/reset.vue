<template>
  <div class="w-full max-w-[23rem]">
    <div class="space-y-8">
      <div class="space-y-2">
        <h1
          class="text-[2.05rem] font-semibold tracking-[-0.06em] text-white/92 sm:text-[2.3rem]"
        >
          {{ $t("resetTitle") }}
        </h1>
        <p class="text-sm text-white/45">
          {{ $t("resetSubtitle") }}
        </p>
      </div>

      <template v-if="hasResetMethods">
        <div
          v-if="resetModes.length > 1"
          class="grid grid-cols-2 gap-2 rounded-[0.8rem] bg-white/6 p-1"
        >
          <button
            v-for="mode in resetModes"
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

        <form class="space-y-5" @submit.prevent="handleReset">
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
              for="reset-code"
            >
              {{ $t("verificationCode") }}
            </label>
            <div class="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
              <input
                id="reset-code"
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
                  activeSender.secondsLeft.value > 0
                "
                @click="handleSendCode"
              >
                {{ sendCodeLabel }}
              </button>
            </div>
          </div>

          <div class="space-y-2.5">
            <label
              class="block text-sm font-medium text-white/72"
              for="new-password"
            >
              {{ $t("newPassword") }}
            </label>
            <input
              id="new-password"
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

          <button
            class="flex h-11 w-full items-center justify-center rounded-[0.7rem] bg-white px-4 text-sm font-medium text-[#14151a] transition-colors hover:bg-white/92 focus:outline-none focus:ring-2 focus:ring-white/12 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            :disabled="isSubmitting"
          >
            <template v-if="isSubmitting">
              <Icon name="eos-icons:loading" class="mr-1 animate-spin" />
              {{ $t("loading") }}
            </template>
            <template v-else>
              {{ $t("resetPasswordAction") }}
            </template>
          </button>
        </form>
      </template>
      <p v-else class="text-sm text-white/48">
        {{ $t("resetUnavailable") }}
      </p>

      <p class="text-center text-sm text-white/48">
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
import { useRouter } from "vue-router";
import { useAuthMethods } from "~/composables/useAuthMethods";
import { useVerificationCode } from "~/composables/useVerificationCode";
import { useAlertStore } from "~/stores/alert";

const { t } = useI18n();
const router = useRouter();
const alertStore = useAlertStore();
const api = useApiClient();
const { methods, loadAuthMethods } = useAuthMethods();

const activeMode = ref("email");
const email = ref("");
const phoneCode = ref("86");
const phone = ref("");
const verificationCode = ref("");
const password = ref("");
const confirmPassword = ref("");
const isSubmitting = ref(false);

const emailSender = useVerificationCode();
const phoneSender = useVerificationCode();

definePageMeta({
  layout: "auth",
});

const resetModes = computed(() => {
  if (!methods.value) {
    return [{ value: "email", label: t("emailMode") }];
  }

  const availableModes = [];

  if (methods.value.reset?.email) {
    availableModes.push({ value: "email", label: t("emailMode") });
  }

  if (methods.value.reset?.phone) {
    availableModes.push({ value: "phone", label: t("phoneMode") });
  }

  return availableModes;
});

const hasResetMethods = computed(
  () => !methods.value || resetModes.value.length > 0
);

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

const validateResetFields = () => {
  if (!verificationCode.value || !password.value || !confirmPassword.value) {
    alertStore.showAlert(t("pleaseCompleteResetInfo"), "error");
    return false;
  }

  if (password.value !== confirmPassword.value) {
    alertStore.showAlert(t("passwordsDoNotMatch"), "error");
    return false;
  }

  return true;
};

const handleSendCode = async () => {
  try {
    await activeSender.value.send(async () => {
      if (activeMode.value === "email") {
        if (!email.value) {
          throw new Error(t("pleaseEnterEmail"));
        }

        const response = await api("/auth/reset/email/send", {
          method: "POST",
          body: {
            email: email.value,
          },
        });

        if (!response.success) {
          throw new Error(response.message || t("sendCodeFailed"));
        }

        alertStore.showAlert(response.message || t("codeSent"), "success");
        return;
      }

      if (!phoneCode.value || !phone.value) {
        throw new Error(t("pleaseEnterPhone"));
      }

      const response = await api("/auth/reset/phone/send", {
        method: "POST",
        body: {
          phoneCode: phoneCode.value,
          phone: phone.value,
        },
      });

      if (!response.success) {
        throw new Error(response.message || t("sendCodeFailed"));
      }

      alertStore.showAlert(response.message || t("codeSent"), "success");
    });
  } catch (error) {
    alertStore.showAlert(error.message || t("sendCodeFailed"), "error");
  }
};

const handleReset = async () => {
  if (activeMode.value === "email" && !email.value) {
    alertStore.showAlert(t("pleaseEnterEmail"), "error");
    return;
  }

  if (activeMode.value === "phone" && (!phoneCode.value || !phone.value)) {
    alertStore.showAlert(t("pleaseEnterPhone"), "error");
    return;
  }

  if (!validateResetFields()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await api(
      activeMode.value === "email" ? "/auth/reset/email" : "/auth/reset/phone",
      {
        method: "POST",
        body: {
          email: email.value,
          phoneCode: phoneCode.value,
          phone: phone.value,
          password: password.value,
          code: verificationCode.value,
        },
      }
    );

    if (!response.success) {
      alertStore.showAlert(response.message || t("resetFailed"), "error");
      return;
    }

    alertStore.showAlert(response.message || t("resetSuccessMsg"), "success");
    await router.push("/auth/login");
  } catch (error) {
    alertStore.showAlert(error.message || t("resetFailed"), "error");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadAuthMethods();
});

watch(
  resetModes,
  (nextModes) => {
    if (!nextModes.some((mode) => mode.value === activeMode.value)) {
      activeMode.value = nextModes[0]?.value || "email";
    }
  },
  { immediate: true }
);
</script>

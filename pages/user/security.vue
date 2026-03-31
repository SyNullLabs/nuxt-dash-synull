<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("securitySettings") }}</h1>

    <div class="space-y-4">
      <!-- Phone binding -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-white">{{ t("phoneBinding") }}</h3>
            <p class="mt-1 text-xs text-white/40">
              {{ userPhone ? t("boundTo", { value: userPhone }) : t("notBound") }}
            </p>
          </div>
          <UButton variant="soft" size="sm" @click="openPhoneModal">
            {{ userPhone ? t("change") : t("bind") }}
          </UButton>
        </div>
      </div>

      <!-- Email binding -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-white">{{ t("emailBinding") }}</h3>
            <p class="mt-1 text-xs text-white/40">
              {{ userEmail ? t("boundTo", { value: userEmail }) : t("notBound") }}
            </p>
          </div>
          <UButton variant="soft" size="sm" @click="openEmailModal">
            {{ userEmail ? t("change") : t("bind") }}
          </UButton>
        </div>
      </div>

      <!-- 2FA -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-white">{{ t("twoFactorAuth") }}</h3>
            <p class="mt-1 text-xs text-white/40">{{ t("twoFactorDesc") }}</p>
          </div>
          <UToggle v-model="twoFactorEnabled" @update:model-value="toggle2FA" />
        </div>
      </div>

      <!-- Login SMS Reminder -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-white">{{ t("loginSmsReminder") }}</h3>
            <p class="mt-1 text-xs text-white/40">{{ t("loginSmsDesc") }}</p>
          </div>
          <UToggle v-model="smsReminder" @update:model-value="toggleSmsReminder" />
        </div>
      </div>

      <!-- Login Email Reminder -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-white">{{ t("loginEmailReminder") }}</h3>
            <p class="mt-1 text-xs text-white/40">{{ t("loginEmailDesc") }}</p>
          </div>
          <UToggle v-model="emailReminder" @update:model-value="toggleEmailReminder" />
        </div>
      </div>
    </div>

    <!-- Phone bind modal -->
    <UModal v-model:open="showPhoneModal">
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-white">{{ t("bindPhone") }}</h3>
          <div class="space-y-3">
            <UFormField :label="t('phone')">
              <UInput v-model="phoneForm.phone" :placeholder="t('enterPhone')" />
            </UFormField>
            <UFormField :label="t('verificationCode')">
              <div class="flex gap-2">
                <UInput v-model="phoneForm.code" :placeholder="t('enterVerificationCode')" class="flex-1" />
                <UButton variant="soft" size="sm" :loading="sendingPhoneCode" @click="sendPhoneCode">
                  {{ t("sendCode") }}
                </UButton>
              </div>
            </UFormField>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <UButton variant="ghost" @click="showPhoneModal = false">{{ t("cancel") }}</UButton>
            <UButton :loading="bindingPhone" @click="bindPhone">{{ t("confirm") }}</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Email bind modal -->
    <UModal v-model:open="showEmailModal">
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-white">{{ t("bindEmail") }}</h3>
          <div class="space-y-3">
            <UFormField :label="t('email')">
              <UInput v-model="emailForm.email" type="email" :placeholder="t('enterEmail')" />
            </UFormField>
            <UFormField :label="t('verificationCode')">
              <div class="flex gap-2">
                <UInput v-model="emailForm.code" :placeholder="t('enterVerificationCode')" class="flex-1" />
                <UButton variant="soft" size="sm" :loading="sendingEmailCode" @click="sendEmailCode">
                  {{ t("sendCode") }}
                </UButton>
              </div>
            </UFormField>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <UButton variant="ghost" @click="showEmailModal = false">{{ t("cancel") }}</UButton>
            <UButton :loading="bindingEmail" @click="bindEmail">{{ t("confirm") }}</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <TurnstileDialog
      v-model="securityTurnstile.token"
      :open="securityTurnstile.isOpen"
      :nonce="securityTurnstile.nonce"
      :title="t('verify')"
      :description="t('completeVerification')"
      @error="handleTurnstileError"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useToast } from "#imports";
import { useI18n } from "vue-i18n";
import { useTurnstileChallenge } from "~/composables/useTurnstileChallenge";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();
const securityTurnstile = useTurnstileChallenge();

const userPhone = ref("");
const userEmail = ref("");
const twoFactorEnabled = ref(false);
const smsReminder = ref(false);
const emailReminder = ref(false);

const showPhoneModal = ref(false);
const showEmailModal = ref(false);
const sendingPhoneCode = ref(false);
const sendingEmailCode = ref(false);
const bindingPhone = ref(false);
const bindingEmail = ref(false);

const phoneForm = reactive({ phone: "", code: "" });
const emailForm = reactive({ email: "", code: "" });

onMounted(async () => {
  try {
    const res = await api("/dash/user-info");
    if (res?.success && res.data?.client) {
      userPhone.value = res.data.client.phonenumber || "";
      userEmail.value = res.data.client.email || "";
    }
  } catch {
    // silent
  }
});

const handleTurnstileError = () => {
  toast.add({ title: t("turnstileError"), color: "error" });
};

const withSecurityTurnstile = async (handler) => {
  const turnstileToken = await securityTurnstile.ensureToken();

  try {
    return await handler(turnstileToken);
  } finally {
    securityTurnstile.reset();
  }
};

const securityAction = async (action, body = {}) => {
  try {
    const res = await withSecurityTurnstile((turnstileToken) =>
      api("/user/security", {
        method: "POST",
        body: { action, ...body, turnstileToken },
      })
    );
    if (res?.success) {
      toast.add({ title: res.message || t("success"), color: "success" });
      return true;
    }
    toast.add({ title: res?.message || t("operationFailed"), color: "error" });
    return false;
  } catch {
    toast.add({ title: t("operationFailed"), color: "error" });
    return false;
  }
};

const openPhoneModal = () => {
  phoneForm.phone = "";
  phoneForm.code = "";
  showPhoneModal.value = true;
};

const openEmailModal = () => {
  emailForm.email = "";
  emailForm.code = "";
  showEmailModal.value = true;
};

const sendPhoneCode = async () => {
  if (!phoneForm.phone) {
    toast.add({ title: t("pleaseEnterPhone"), color: "error" });
    return;
  }

  sendingPhoneCode.value = true;
  const action = userPhone.value ? "change_phone_send" : "bind_phone_send";
  await securityAction(action, { phone: phoneForm.phone });
  sendingPhoneCode.value = false;
};

const bindPhone = async () => {
  if (!phoneForm.phone) {
    toast.add({ title: t("pleaseEnterPhone"), color: "error" });
    return;
  }

  if (!phoneForm.code) {
    toast.add({ title: t("pleaseEnterVerificationCode"), color: "error" });
    return;
  }

  bindingPhone.value = true;
  const action = userPhone.value ? "change_phone" : "bind_phone";
  const ok = await securityAction(action, { phone: phoneForm.phone, code: phoneForm.code });
  if (ok) {
    userPhone.value = phoneForm.phone;
    showPhoneModal.value = false;
  }
  bindingPhone.value = false;
};

const sendEmailCode = async () => {
  if (!emailForm.email) {
    toast.add({ title: t("pleaseEnterEmail"), color: "error" });
    return;
  }

  sendingEmailCode.value = true;
  const action = userEmail.value ? "change_email_send" : "bind_email_send";
  await securityAction(action, { email: emailForm.email });
  sendingEmailCode.value = false;
};

const bindEmail = async () => {
  if (!emailForm.email) {
    toast.add({ title: t("pleaseEnterEmail"), color: "error" });
    return;
  }

  if (!emailForm.code) {
    toast.add({ title: t("pleaseEnterVerificationCode"), color: "error" });
    return;
  }

  bindingEmail.value = true;
  const action = userEmail.value ? "change_email" : "bind_email";
  const ok = await securityAction(action, { email: emailForm.email, code: emailForm.code });
  if (ok) {
    userEmail.value = emailForm.email;
    showEmailModal.value = false;
  }
  bindingEmail.value = false;
};

const toggle2FA = async (val) => {
  const ok = await securityAction("toggle_2fa");
  if (!ok) twoFactorEnabled.value = !val;
};

const toggleSmsReminder = async (val) => {
  const ok = await securityAction("login_sms_reminder");
  if (!ok) smsReminder.value = !val;
};

const toggleEmailReminder = async (val) => {
  const ok = await securityAction("login_email_reminder");
  if (!ok) emailReminder.value = !val;
};
</script>

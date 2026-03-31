<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("personalProfile") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-5">
      <USkeleton class="mb-3 h-6 w-48 rounded-lg" />
      <USkeleton class="h-32 w-full rounded-lg" />
    </div>

    <div v-else class="grid gap-5 lg:grid-cols-2">
      <!-- Profile info -->
      <div class="dashboard-panel rounded-2xl p-5">
        <h3 class="mb-4 text-sm font-medium text-white/50">{{ t("basicInfo") }}</h3>
        <form @submit.prevent="saveProfile" class="space-y-4">
          <UFormField :label="t('username')">
            <UInput v-model="form.username" />
          </UFormField>
          <UFormField :label="t('email')">
            <UInput v-model="form.email" type="email" disabled />
          </UFormField>
          <UFormField :label="t('phone')">
            <UInput v-model="form.phonenumber" />
          </UFormField>
          <UFormField :label="t('address')">
            <UInput v-model="form.address1" />
          </UFormField>
          <UFormField :label="t('company')">
            <UInput v-model="form.companyname" />
          </UFormField>
          <UButton type="submit" :loading="saving" icon="i-solar-check-circle-bold-duotone">
            {{ t("saveChanges") }}
          </UButton>
        </form>
      </div>

      <!-- Change password -->
      <div class="dashboard-panel rounded-2xl p-5">
        <h3 class="mb-4 text-sm font-medium text-white/50">{{ t("changePassword") }}</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <UFormField :label="t('currentPassword')">
            <UInput v-model="pwForm.old_password" type="password" />
          </UFormField>
          <UFormField :label="t('newPassword')">
            <UInput v-model="pwForm.new_password" type="password" />
          </UFormField>
          <UFormField :label="t('confirmPassword')">
            <UInput v-model="pwForm.confirm_password" type="password" />
          </UFormField>
          <UButton type="submit" :loading="changingPw" icon="i-solar-lock-bold-duotone">
            {{ t("changePassword") }}
          </UButton>
        </form>
      </div>
    </div>

    <TurnstileDialog
      v-model="passwordTurnstile.token"
      :open="passwordTurnstile.isOpen"
      :nonce="passwordTurnstile.nonce"
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
const passwordTurnstile = useTurnstileChallenge();

const loading = ref(true);
const saving = ref(false);
const changingPw = ref(false);

const form = reactive({
  username: "",
  email: "",
  phonenumber: "",
  address1: "",
  companyname: "",
});

const pwForm = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});

onMounted(async () => {
  try {
    const res = await api("/dash/user-info");
    if (res?.success && res.data) {
      const client = res.data.client || {};
      form.username = client.username || "";
      form.email = client.email || "";
      form.phonenumber = client.phonenumber || "";
      form.address1 = client.address1 || "";
      form.companyname = client.companyname || "";
    }
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
});

const handleTurnstileError = () => {
  toast.add({ title: t("turnstileError"), color: "error" });
};

const withPasswordTurnstile = async (handler) => {
  const turnstileToken = await passwordTurnstile.ensureToken();

  try {
    return await handler(turnstileToken);
  } finally {
    passwordTurnstile.reset();
  }
};

const saveProfile = async () => {
  saving.value = true;
  try {
    const res = await api("/user/info", { method: "PUT", body: { ...form } });
    if (res?.success) {
      toast.add({ title: res.message || t("profileSaved"), color: "success" });
    } else {
      toast.add({ title: res?.message || t("saveFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("saveFailed"), color: "error" });
  } finally {
    saving.value = false;
  }
};

const changePassword = async () => {
  if (pwForm.new_password !== pwForm.confirm_password) {
    toast.add({ title: t("passwordsDoNotMatch"), color: "error" });
    return;
  }
  changingPw.value = true;
  try {
    const res = await withPasswordTurnstile((turnstileToken) =>
      api("/user/password", {
        method: "POST",
        body: { ...pwForm, turnstileToken },
      })
    );
    if (res?.success) {
      toast.add({ title: res.message || t("passwordChanged"), color: "success" });
      pwForm.old_password = "";
      pwForm.new_password = "";
      pwForm.confirm_password = "";
    } else {
      toast.add({ title: res?.message || t("changeFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("changeFailed"), color: "error" });
  } finally {
    changingPw.value = false;
  }
};
</script>

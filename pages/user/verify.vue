<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("realNameVerify") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-5">
      <USkeleton class="h-32 w-full rounded-lg" />
    </div>

    <div v-else class="mx-auto max-w-2xl space-y-4">
      <!-- Status card -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-center gap-3">
          <Icon
            :name="statusIcon"
            class="text-3xl"
            :class="statusIconClass"
          />
          <div>
            <h3 class="text-sm font-medium text-white">{{ statusText }}</h3>
            <p v-if="verifyData?.reason" class="mt-1 text-xs text-white/40">{{ verifyData.reason }}</p>
          </div>
        </div>
      </div>

      <!-- Verification form (show if not verified) -->
      <div v-if="!isVerified" class="dashboard-panel rounded-2xl p-5">
        <form @submit.prevent="submitVerify" class="space-y-4">
          <UFormField :label="t('realName')">
            <UInput v-model="form.name" :placeholder="t('enterRealName')" />
          </UFormField>
          <UFormField :label="t('idNumber')">
            <UInput v-model="form.id_number" :placeholder="t('enterIdNumber')" />
          </UFormField>
          <UFormField :label="t('companyName')">
            <UInput v-model="form.company" :placeholder="t('optional')" />
          </UFormField>
          <UButton type="submit" :loading="submitting" icon="i-solar-check-circle-bold-duotone">
            {{ t("submitVerification") }}
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();

const loading = ref(true);
const submitting = ref(false);
const verifyData = ref(null);
const form = reactive({ name: "", id_number: "", company: "" });

const isVerified = computed(() => verifyData.value?.status === "verified" || verifyData.value?.status === 1);

const statusIcon = computed(() => {
  if (isVerified.value) return "solar:verified-check-bold-duotone";
  if (verifyData.value?.status === "pending") return "solar:clock-circle-bold-duotone";
  return "solar:shield-warning-bold-duotone";
});

const statusIconClass = computed(() => {
  if (isVerified.value) return "text-green-400";
  if (verifyData.value?.status === "pending") return "text-yellow-400";
  return "text-white/30";
});

const statusText = computed(() => {
  if (isVerified.value) return t("verified");
  if (verifyData.value?.status === "pending") return t("verifyPending");
  if (verifyData.value?.status === "rejected") return t("verifyRejected");
  return t("notVerified");
});

onMounted(async () => {
  try {
    const res = await api("/user/verify");
    if (res?.success && res.data) verifyData.value = res.data;
  } catch {} finally { loading.value = false; }
});

const submitVerify = async () => {
  submitting.value = true;
  try {
    const res = await api("/user/verify", { method: "POST", body: { ...form } });
    if (res?.success) {
      toast.add({ title: res.message || t("verifySubmitted"), color: "success" });
      verifyData.value = { status: "pending" };
    } else {
      toast.add({ title: res?.message || t("submitFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("submitFailed"), color: "error" });
  } finally { submitting.value = false; }
};
</script>
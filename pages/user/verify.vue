<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("realNameVerify") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-5">
      <USkeleton class="h-32 w-full rounded-lg" />
    </div>

    <div v-else class="mx-auto max-w-3xl space-y-4">
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex items-start gap-3">
          <Icon :name="statusIcon" class="text-3xl" :class="statusIconClass" />
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-medium text-white">{{ statusText }}</h3>
            <p v-if="failureReason" class="mt-1 text-xs text-white/40">
              {{ failureReason }}
            </p>
            <p
              v-if="verifyData?.update_time || verifyData?.create_time"
              class="mt-1 text-xs text-white/30"
            >
              {{ verifyData?.update_time || verifyData?.create_time }}
            </p>
          </div>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="space-y-1">
            <p class="text-xs text-white/35">{{ t("realName") }}</p>
            <p class="text-sm text-white">
              {{ form.real_name || verifyData?.auth_rela_name || "—" }}
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-white/35">{{ t("companyName") }}</p>
            <p class="text-sm text-white">
              {{ form.company_name || verifyData?.company_name || "—" }}
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-white/35">{{ t("businessLicenseNumber") }}</p>
            <p class="text-sm text-white">
              {{ form.company_organ_code || verifyData?.company_organ_code || "—" }}
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-white/35">{{ t("idNumber") }}</p>
            <p class="text-sm text-white">
              {{ form.idcard || verifyData?.auth_card_number || "—" }}
            </p>
          </div>
        </div>

        <div v-if="existingImages.length" class="mt-4 space-y-2">
          <p class="text-xs text-white/35">{{ t("verificationImages") }}</p>
          <div class="grid gap-3 sm:grid-cols-3">
            <a
              v-for="(image, index) in existingImages"
              :key="`${image}-${index}`"
              :href="image"
              target="_blank"
              rel="noreferrer"
              class="overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <img
                :src="image"
                :alt="`${t('verificationImages')} ${index + 1}`"
                class="h-32 w-full object-cover"
              />
            </a>
          </div>
        </div>
      </div>

      <div v-if="canEdit" class="dashboard-panel rounded-2xl p-5">
        <form class="space-y-4" @submit.prevent="submitVerify">
          <UFormField :label="t('realName')">
            <UInput
              v-model="form.real_name"
              :placeholder="t('enterRealName')"
            />
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="t('companyName')">
              <UInput
                v-model="form.company_name"
                :placeholder="t('companyName')"
              />
            </UFormField>
            <UFormField :label="t('businessLicenseNumber')">
              <UInput
                v-model="form.company_organ_code"
                :placeholder="t('enterBusinessLicenseNumber')"
              />
            </UFormField>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="t('idNumber')">
              <UInput
                v-model="form.idcard"
                :placeholder="t('enterIdNumber')"
              />
            </UFormField>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-white/72">
                {{ t("cardType") }}
              </label>
              <select
                v-model="form.card_type"
                class="h-10 w-full rounded-[0.7rem] border border-white/10 bg-white/6 px-3 text-sm text-white focus:border-synull/45 focus:outline-none focus:ring-2 focus:ring-synull/18"
              >
                <option
                  v-for="option in cardTypeOptions"
                  :key="option.value"
                  :value="option.value"
                  class="bg-[#14151a] text-white"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/72">
              {{ t("verificationImages") }}
            </label>
            <input
              :key="fileInputKey"
              type="file"
              accept="image/*"
              multiple
              class="block w-full rounded-[0.7rem] border border-dashed border-white/15 bg-white/4 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
              @change="handleFileChange"
            />
            <p class="text-xs text-white/40">
              {{ t("verificationImagesHint") }}
            </p>
            <div v-if="selectedFiles.length" class="flex flex-wrap gap-2">
              <span
                v-for="file in selectedFiles"
                :key="file.name"
                class="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72"
              >
                {{ file.name }}
              </span>
            </div>
          </div>

          <UButton
            type="submit"
            :loading="submitting"
            icon="i-solar-check-circle-bold-duotone"
          >
            {{ t("submitVerification") }}
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "#imports";
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();

const loading = ref(true);
const submitting = ref(false);
const verifyData = ref(null);
const selectedFiles = ref([]);
const fileInputKey = ref(0);
const form = reactive({
  certifi_type: "certifi_company",
  real_name: "",
  company_name: "",
  company_organ_code: "",
  card_type: "1",
  idcard: "",
});

const normalizeVerifyStatus = (value) => {
  const normalizedValue = `${value ?? ""}`.trim().toLowerCase();

  if (value === 1 || normalizedValue === "1" || normalizedValue === "verified") {
    return "verified";
  }

  if (value === 2 || normalizedValue === "2" || normalizedValue === "rejected") {
    return "rejected";
  }

  if (value === 3 || normalizedValue === "3" || normalizedValue === "pending") {
    return "pending";
  }

  if (
    value === 4 ||
    normalizedValue === "4" ||
    normalizedValue === "submitted"
  ) {
    return "submitted";
  }

  return "not_verified";
};

const verifyStatus = computed(() => normalizeVerifyStatus(verifyData.value?.status));
const isVerified = computed(() => verifyStatus.value === "verified");
const canEdit = computed(
  () => verifyStatus.value === "not_verified" || verifyStatus.value === "rejected"
);
const failureReason = computed(
  () => verifyData.value?.auth_fail || verifyData.value?.reason || ""
);
const statusIcon = computed(() => {
  if (isVerified.value) {
    return "solar:verified-check-bold-duotone";
  }

  if (verifyStatus.value === "pending" || verifyStatus.value === "submitted") {
    return "solar:clock-circle-bold-duotone";
  }

  if (verifyStatus.value === "rejected") {
    return "solar:danger-triangle-bold-duotone";
  }

  return "solar:shield-warning-bold-duotone";
});
const statusIconClass = computed(() => {
  if (isVerified.value) {
    return "text-green-400";
  }

  if (verifyStatus.value === "pending" || verifyStatus.value === "submitted") {
    return "text-yellow-400";
  }

  if (verifyStatus.value === "rejected") {
    return "text-red-400";
  }

  return "text-white/30";
});
const statusText = computed(() => {
  if (isVerified.value) {
    return t("verified");
  }

  if (verifyStatus.value === "pending") {
    return t("verifyPending");
  }

  if (verifyStatus.value === "submitted") {
    return t("verifySubmitted");
  }

  if (verifyStatus.value === "rejected") {
    return t("verifyRejected");
  }

  return t("notVerified");
});
const existingImages = computed(() =>
  [
    verifyData.value?.img_one,
    verifyData.value?.img_two,
    verifyData.value?.img_three,
  ].filter(Boolean)
);
const cardTypeOptions = computed(() => [
  { value: "1", label: t("mainlandIdCard") },
  { value: "0", label: t("nonMainlandIdCard") },
]);

const resetSelectedFiles = () => {
  selectedFiles.value = [];
  fileInputKey.value += 1;
};

const syncForm = (data = {}) => {
  form.certifi_type =
    data?.certifi?.type || data?.certifi_type || "certifi_company";
  form.real_name = data?.auth_rela_name || data?.real_name || "";
  form.company_name = data?.company_name || "";
  form.company_organ_code = data?.company_organ_code || "";
  form.card_type = `${data?.auth_card_type ?? data?.card_type ?? 1}`;
  form.idcard = data?.auth_card_number || data?.idcard || "";
};

const loadVerify = async () => {
  loading.value = true;

  try {
    const res = await api("/user/verify");

    if (res?.success && res.data) {
      verifyData.value = res.data;
      syncForm(res.data);
      return;
    }

    toast.add({ title: res?.message || t("operationFailed"), color: "error" });
  } catch (error) {
    toast.add({
      title: error?.data?.message || error?.message || t("operationFailed"),
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (event) => {
  selectedFiles.value = Array.from(event.target.files || []);
};

const submitVerify = async () => {
  if (
    !form.real_name.trim() ||
    !form.company_name.trim() ||
    !form.company_organ_code.trim() ||
    !form.idcard.trim()
  ) {
    toast.add({
      title: t("pleaseCompleteVerificationForm"),
      color: "error",
    });
    return;
  }

  if (!selectedFiles.value.length && !existingImages.value.length) {
    toast.add({
      title: t("uploadAtLeastThreeImages"),
      color: "error",
    });
    return;
  }

  submitting.value = true;

  try {
    const body = new FormData();
    body.append("certifi_type", form.certifi_type);
    body.append("company_name", form.company_name.trim());
    body.append("company_organ_code", form.company_organ_code.trim());
    body.append("real_name", form.real_name.trim());
    body.append("card_type", form.card_type);
    body.append("idcard", form.idcard.trim());

    selectedFiles.value.forEach((file) => {
      body.append("idimage[]", file);
    });

    const res = await api("/user/verify", { method: "POST", body });

    if (res?.success) {
      toast.add({
        title: res.message || t("verifySubmitted"),
        color: "success",
      });
      resetSelectedFiles();
      await loadVerify();
      return;
    }

    toast.add({ title: res?.message || t("submitFailed"), color: "error" });
  } catch (error) {
    toast.add({
      title: error?.data?.message || error?.message || t("submitFailed"),
      color: "error",
    });
  } finally {
    submitting.value = false;
  }
};

onMounted(loadVerify);
</script>

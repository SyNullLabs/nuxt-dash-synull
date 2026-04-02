<template>
  <div>
    <h1 class="mb-5 text-xl font-semibold text-white">{{ t("affiliateProgram") }}</h1>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-5">
      <USkeleton class="h-32 w-full rounded-lg" />
    </div>

    <div v-else class="space-y-4">
      <!-- Affiliate stats -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="dashboard-panel rounded-2xl p-5">
          <p class="text-xs text-white/40">{{ t("totalReferrals") }}</p>
          <p class="mt-1 text-xl font-semibold text-white">{{ affData.total_referrals || 0 }}</p>
        </div>
        <div class="dashboard-panel rounded-2xl p-5">
          <p class="text-xs text-white/40">{{ t("totalEarnings") }}</p>
          <p class="mt-1 text-xl font-semibold text-synull">{{ affData.total_earnings || "0.00" }}</p>
        </div>
        <div class="dashboard-panel rounded-2xl p-5">
          <p class="text-xs text-white/40">{{ t("availableWithdraw") }}</p>
          <p class="mt-1 text-xl font-semibold text-green-400">{{ affData.available_balance || "0.00" }}</p>
        </div>
      </div>

      <!-- Referral link -->
      <div v-if="affData.referral_link" class="dashboard-panel rounded-2xl p-5">
        <h3 class="mb-3 text-sm font-medium text-white/50">{{ t("referralLink") }}</h3>
        <div class="flex items-center gap-2">
          <code class="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 font-mono truncate">
            {{ affData.referral_link }}
          </code>
          <UButton variant="soft" size="sm" @click="copyLink" icon="i-solar-copy-bold-duotone">
            {{ t("copy") }}
          </UButton>
        </div>
      </div>

      <!-- Activate if not active -->
      <div v-if="!affData.is_active" class="dashboard-panel rounded-2xl p-5 text-center">
        <p class="mb-3 text-white/50">{{ t("affiliateNotActive") }}</p>
        <UButton @click="activate" :loading="activating">{{ t("activateAffiliate") }}</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "#imports";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();

const loading = ref(true);
const activating = ref(false);
const affData = ref({});

const loadAffiliate = async () => {
  loading.value = true;

  try {
    const res = await api("/user/affiliate", { query: { action: "page" } });
    if (res?.success && res.data) {
      affData.value = res.data;
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

const activate = async () => {
  activating.value = true;
  try {
    const res = await api("/user/affiliate", { query: { action: "activate" } });
    if (res?.success) {
      toast.add({ title: t("activated"), color: "success" });
      await loadAffiliate();
    } else {
      toast.add({ title: res?.message || t("operationFailed"), color: "error" });
    }
  } catch (error) {
    toast.add({
      title: error?.data?.message || error?.message || t("operationFailed"),
      color: "error",
    });
  } finally {
    activating.value = false;
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(affData.value.referral_link);
    toast.add({ title: t("copied"), color: "success" });
  } catch {
    toast.add({ title: t("copyFailed"), color: "error" });
  }
};

onMounted(loadAffiliate);
</script>

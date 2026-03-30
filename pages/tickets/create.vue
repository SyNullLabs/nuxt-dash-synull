<template>
  <div>
    <div class="mb-5 flex items-center gap-2">
      <UButton
        to="/tickets"
        variant="ghost"
        color="neutral"
        icon="i-solar-arrow-left-outline"
        size="sm"
        class="text-white/50"
      />
      <h1 class="text-xl font-semibold text-white">{{ t("createTicket") }}</h1>
    </div>

    <div class="dashboard-panel mx-auto max-w-2xl rounded-2xl p-5">
      <form @submit.prevent="submitTicket" class="space-y-4">
        <UFormField :label="t('ticketTitle')" required>
          <UInput v-model="form.name" :placeholder="t('enterTicketTitle')" />
        </UFormField>

        <UFormField :label="t('department')" required>
          <USelectMenu
            v-model="form.dptid"
            :items="departments"
            label-key="name"
            value-key="id"
            :placeholder="t('selectDepartment')"
          />
        </UFormField>

        <UFormField :label="t('priority')">
          <USelectMenu
            v-model="form.priority"
            :items="priorities"
            label-key="label"
            value-key="value"
          />
        </UFormField>

        <UFormField :label="t('ticketContent')" required>
          <UTextarea
            v-model="form.content"
            :placeholder="t('enterTicketContent')"
            :rows="6"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" :loading="submitting" icon="i-solar-send-bold-duotone">
            {{ t("submitTicket") }}
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();

const submitting = ref(false);
const departments = ref([]);
const priorities = [
  { label: t("low"), value: "Low" },
  { label: t("medium"), value: "Medium" },
  { label: t("high"), value: "High" },
];

const form = reactive({
  name: "",
  dptid: "",
  priority: "Medium",
  content: "",
});

onMounted(async () => {
  try {
    const res = await api("/ticket/departments");
    if (res?.success && res.data) {
      departments.value = Array.isArray(res.data) ? res.data : res.data.list || [];
    }
  } catch {
    // silent
  }
});

const submitTicket = async () => {
  if (!form.name || !form.dptid || !form.content) {
    toast.add({ title: t("pleaseCompleteForm"), color: "error" });
    return;
  }
  submitting.value = true;
  try {
    const res = await api("/ticket/create", { method: "POST", body: { ...form } });
    if (res?.success) {
      toast.add({ title: res.message || t("ticketCreated"), color: "success" });
      navigateTo("/tickets");
    } else {
      toast.add({ title: res?.message || t("createFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("createFailed"), color: "error" });
  } finally {
    submitting.value = false;
  }
};
</script>
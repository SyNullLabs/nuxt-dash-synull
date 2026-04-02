<template>
  <div>
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-white">{{ t("subAccounts") }}</h1>
      <UButton icon="i-solar-user-plus-bold-duotone" @click="openCreateModal">
        {{ t("addSubAccount") }}
      </UButton>
    </div>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-8 text-center">
      <span class="text-sm text-white/50">{{ t("loading") }}</span>
    </div>

    <div v-else-if="contacts.length === 0" class="dashboard-panel rounded-2xl p-12 text-center">
      <Icon name="solar:users-group-rounded-bold-duotone" class="mx-auto mb-4 text-5xl text-white/15" />
      <p class="text-white/45">{{ t("noSubAccounts") }}</p>
    </div>

    <div v-else class="space-y-2">
      <div v-for="contact in contacts" :key="contact.id" class="dashboard-panel rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-white">{{ contact.name || contact.email }}</p>
            <p class="mt-0.5 text-xs text-white/40">{{ contact.email }} · {{ contact.phonenumber }}</p>
          </div>
          <div class="flex gap-2">
            <UButton variant="ghost" size="xs" icon="i-solar-pen-bold-duotone" @click="editContact(contact)" />
            <UButton variant="ghost" color="error" size="xs" icon="i-solar-trash-bin-2-bold-duotone" @click="deleteContact(contact.id)" />
          </div>
        </div>
      </div>
    </div>

    <UModal v-model:open="showAddModal">
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-white">
            {{ editingId ? t("editSubAccount") : t("addSubAccount") }}
          </h3>
          <form @submit.prevent="saveContact" class="space-y-3">
            <UFormField :label="t('name')">
              <UInput v-model="contactForm.name" />
            </UFormField>
            <UFormField :label="t('email')">
              <UInput v-model="contactForm.email" type="email" />
            </UFormField>
            <UFormField :label="t('phone')">
              <UInput v-model="contactForm.phonenumber" />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showAddModal = false">{{ t("cancel") }}</UButton>
              <UButton type="submit" :loading="saving">{{ t("confirm") }}</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { useToast } from "#imports";
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();
const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const contacts = ref([]);
const showAddModal = ref(false);
const editingId = ref(null);
const contactForm = reactive({ name: "", email: "", phonenumber: "" });

const resetContactForm = () => {
  editingId.value = null;
  contactForm.name = "";
  contactForm.email = "";
  contactForm.phonenumber = "";
};

const openCreateModal = () => {
  resetContactForm();
  showAddModal.value = true;
};

const loadContacts = async () => {
  loading.value = true;
  try {
    const res = await api("/user/contacts");
    if (res?.success && res.data) {
      contacts.value = Array.isArray(res.data) ? res.data : res.data.list || [];
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

const editContact = (c) => {
  editingId.value = c.id;
  contactForm.name = c.name || "";
  contactForm.email = c.email || "";
  contactForm.phonenumber = c.phonenumber || "";
  showAddModal.value = true;
};

const saveContact = async () => {
  saving.value = true;
  try {
    const body = { ...contactForm };
    if (editingId.value) body.id = editingId.value;
    const res = await api("/user/contacts", { method: "POST", body });
    if (res?.success) {
      toast.add({ title: res.message || t("saved"), color: "success" });
      showAddModal.value = false;
      editingId.value = null;
      await loadContacts();
    } else {
      toast.add({ title: res?.message || t("saveFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("saveFailed"), color: "error" });
  } finally { saving.value = false; }
};

const deleteContact = async (id) => {
  try {
    const res = await api("/user/contacts", { method: "DELETE", query: { id } });
    if (res?.success) {
      toast.add({ title: t("deleted"), color: "success" });
      await loadContacts();
    } else {
      toast.add({ title: res?.message || t("deleteFailed"), color: "error" });
    }
  } catch (error) {
    console.error("[user/contacts] delete failed", error);
    toast.add({ title: t("deleteFailed"), color: "error" });
  }
};

onMounted(loadContacts);
</script>

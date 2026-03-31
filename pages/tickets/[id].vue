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
      <h1 class="flex-1 text-xl font-semibold text-white">
        {{ ticket?.title || ticket?.name || t("ticketDetail") }}
      </h1>
      <UButton
        v-if="ticket && ticket.status !== 'Closed'"
        variant="soft"
        color="error"
        size="sm"
        @click="closeTicket"
        :loading="closing"
      >
        {{ t("closeTicket") }}
      </UButton>
    </div>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-8 text-center">
      <span class="text-sm text-white/50">{{ t("loading") }}</span>
    </div>

    <div v-else-if="error" class="dashboard-panel rounded-2xl p-8 text-center">
      <p class="text-white/60">{{ t("loadFailed") }}</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Ticket info -->
      <div class="dashboard-panel rounded-2xl p-5">
        <div class="flex flex-wrap items-center gap-3 text-sm text-white/45">
          <span>#{{ ticket.id }}</span>
          <span
            class="rounded-full px-2 py-0.5 text-xs"
            :class="ticketStatusClass(ticket.status)"
          >
            {{ ticket.status_text || ticket.status }}
          </span>
          <span v-if="ticket.department_name">{{ ticket.department_name }}</span>
          <span v-if="ticket.create_time">{{ ticket.create_time }}</span>
        </div>
      </div>

      <!-- Messages -->
      <div class="space-y-3">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="[
            'rounded-2xl border p-4',
            msg.is_admin
              ? 'border-synull/15 bg-synull/[0.04]'
              : 'border-white/8 bg-white/[0.03]',
          ]"
        >
          <div class="mb-2 flex items-center justify-between text-xs text-white/40">
            <span class="font-medium" :class="msg.is_admin ? 'text-synull' : 'text-white/60'">
              {{ msg.author || (msg.is_admin ? t("staff") : t("you")) }}
            </span>
            <span>{{ msg.create_time || msg.date }}</span>
          </div>
          <div class="text-sm leading-relaxed text-white/80" v-html="msg.content || msg.message" />
          <div v-if="msg.attachments && msg.attachments.length" class="mt-2 flex flex-wrap gap-1">
            <a
              v-for="(att, aIdx) in msg.attachments"
              :key="aIdx"
              :href="att.url"
              class="rounded-md bg-white/5 px-2 py-1 text-xs text-synull hover:bg-white/10"
            >
              {{ att.name }}
            </a>
          </div>
        </div>
      </div>

      <!-- Reply form -->
      <div v-if="ticket.status !== 'Closed'" class="dashboard-panel rounded-2xl p-5">
        <UFormField :label="t('reply')">
          <UTextarea v-model="replyContent" :placeholder="t('enterReply')" :rows="4" />
        </UFormField>
        <div class="mt-3 flex justify-end">
          <UButton :loading="replying" @click="sendReply" icon="i-solar-send-bold-duotone">
            {{ t("sendReply") }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "#imports";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const api = useApiClient();
const toast = useToast();

const ticketId = route.params.id;
const loading = ref(true);
const error = ref(false);
const closing = ref(false);
const replying = ref(false);
const ticket = ref({});
const messages = ref([]);
const replyContent = ref("");

const ticketStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  const neutralStatusClass =
    "bg-[color:var(--ui-bg-soft)] text-[color:var(--ui-text-muted)] ring-1 ring-[color:var(--ui-border)]";
  if (s === "open" || s === "客户回复") return "bg-green-500/15 text-green-400";
  if (s === "answered" || s === "已回复") return "bg-blue-500/15 text-blue-400";
  if (s === "closed" || s === "已关闭") return neutralStatusClass;
  return neutralStatusClass;
};

const loadTicket = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await api("/ticket/detail", { query: { id: ticketId } });
    if (res?.success && res.data) {
      ticket.value = res.data.ticket || res.data;
      messages.value = res.data.replies || res.data.messages || [];
    } else {
      error.value = true;
    }
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const sendReply = async () => {
  if (!replyContent.value.trim()) return;
  replying.value = true;
  try {
    const res = await api("/ticket/reply", {
      method: "POST",
      body: { id: ticketId, content: replyContent.value },
    });
    if (res?.success) {
      toast.add({ title: t("replySent"), color: "success" });
      replyContent.value = "";
      await loadTicket();
    } else {
      toast.add({ title: res?.message || t("replyFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("replyFailed"), color: "error" });
  } finally {
    replying.value = false;
  }
};

const closeTicket = async () => {
  closing.value = true;
  try {
    const res = await api("/ticket/close", {
      method: "POST",
      body: { id: ticketId },
    });
    if (res?.success) {
      toast.add({ title: t("ticketClosed"), color: "success" });
      await loadTicket();
    } else {
      toast.add({ title: res?.message || t("closeFailed"), color: "error" });
    }
  } catch {
    toast.add({ title: t("closeFailed"), color: "error" });
  } finally {
    closing.value = false;
  }
};

onMounted(loadTicket);
</script>

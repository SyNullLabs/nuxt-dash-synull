<template>
  <div>
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-white">{{ t("tickets") }}</h1>
      <UButton to="/tickets/create" icon="i-solar-pen-new-square-bold-duotone">
        {{ t("createTicket") }}
      </UButton>
    </div>

    <div v-if="loading" class="dashboard-panel rounded-2xl p-8 text-center">
      <span class="text-sm text-white/50">{{ t("loading") }}</span>
    </div>

    <div v-else-if="tickets.length === 0" class="dashboard-panel rounded-2xl p-12 text-center">
      <Icon name="solar:clipboard-text-bold-duotone" class="mx-auto mb-4 text-5xl text-white/15" />
      <p class="mb-1 text-lg text-white/60">{{ t("noTickets") }}</p>
      <p class="mb-5 text-sm text-white/35">{{ t("noTicketsHint") }}</p>
      <UButton to="/tickets/create" variant="soft" icon="i-solar-pen-new-square-bold-duotone">
        {{ t("createTicket") }}
      </UButton>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        @click="navigateTo(`/tickets/${ticket.id}`)"
        class="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-all duration-200 hover:border-white/14 hover:bg-white/[0.05]"
      >
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-white">{{ ticket.title || ticket.name }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs"
                :class="ticketStatusClass(ticket.status)"
              >
                {{ ticket.status_text || ticket.status }}
              </span>
              <span v-if="ticket.priority" class="text-xs text-white/30">
                {{ ticket.priority }}
              </span>
            </div>
            <p class="mt-1 text-xs text-white/40">
              #{{ ticket.id }}
              <span v-if="ticket.department_name" class="ml-2">{{ ticket.department_name }}</span>
              <span v-if="ticket.create_time" class="ml-2">{{ ticket.create_time }}</span>
            </p>
          </div>
          <Icon name="solar:arrow-right-outline" class="text-white/20 group-hover:text-white/50" />
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="mt-4">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="15"
        :total="totalCount"
        active-color="primary"
        class="dashboard-panel rounded-2xl p-1"
        @update:page="loadTickets"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const api = useApiClient();

const loading = ref(true);
const tickets = ref([]);
const currentPage = ref(1);
const totalCount = ref(0);
const totalPages = ref(0);

const ticketStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  const neutralStatusClass =
    "bg-[color:var(--ui-bg-soft)] text-[color:var(--ui-text-muted)] ring-1 ring-[color:var(--ui-border)]";
  if (s === "open" || s === "客户回复") return "bg-green-500/15 text-green-400";
  if (s === "answered" || s === "已回复") return "bg-blue-500/15 text-blue-400";
  if (s === "closed" || s === "已关闭") return neutralStatusClass;
  if (s === "waiting") return "bg-yellow-500/15 text-yellow-400";
  return neutralStatusClass;
};

const loadTickets = async () => {
  loading.value = true;
  try {
    const res = await api("/ticket/list", { query: { page: currentPage.value } });
    if (res?.success && res.data) {
      tickets.value = res.data.list || res.data.data || [];
      totalCount.value = res.data.total || tickets.value.length;
      totalPages.value = Math.ceil(totalCount.value / 15);
    }
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
};

onMounted(loadTickets);
</script>

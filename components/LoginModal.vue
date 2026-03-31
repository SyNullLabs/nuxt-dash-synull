<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-[color:var(--synull-shell-overlay)] px-4 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-bg-elevated)] p-6 text-[color:var(--ui-text)] shadow-[var(--ui-shadow)]"
    >
      <h2 class="mb-4 text-2xl font-bold">{{ $t("login") }}</h2>
      <form @submit.prevent="handleLoginClick">
        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-[color:var(--ui-text-muted)]" for="email">{{
            $t("email")
          }}</label>
          <input
            class="w-full appearance-none rounded-xl border border-[color:var(--ui-border)] bg-[color:var(--ui-bg-soft)] px-3 py-2 text-sm leading-tight text-[color:var(--ui-text)] outline-none transition-colors placeholder:text-[color:var(--ui-text-dim)] focus:border-synull/45 focus:ring-2 focus:ring-synull/18"
            id="email"
            type="email"
            v-model="email"
            required
          />
        </div>
        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-[color:var(--ui-text-muted)]" for="password">{{
            $t("password")
          }}</label>
          <input
            class="w-full appearance-none rounded-xl border border-[color:var(--ui-border)] bg-[color:var(--ui-bg-soft)] px-3 py-2 text-sm leading-tight text-[color:var(--ui-text)] outline-none transition-colors placeholder:text-[color:var(--ui-text-dim)] focus:border-synull/45 focus:ring-2 focus:ring-synull/18"
            id="password"
            type="password"
            v-model="password"
            required
          />
        </div>
        <div class="flex items-center justify-between">
          <button
            class="rounded-xl bg-synull px-4 py-2 font-semibold text-white transition-colors hover:bg-synull/90 focus:outline-none focus:ring-2 focus:ring-synull/20"
            type="submit"
          >
            {{ $t("loginButton") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useAlertStore } from "~/stores/alert";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const alertStore = useAlertStore();
const emit = defineEmits(["close"]);

const email = ref("");
const password = ref("");

const handleLoginClick = async () => {
  try {
    const { data, error } = await useFetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: email.value,
        password: password.value,
      },
    });

    if (error.value) {
      throw error.value;
    }

    const response = data.value;

    if (response.success) {
      authStore.setToken(response.jwt);
      localStorage.setItem("jwt", response.jwt);
      alertStore.showAlert(t("loginSuccess"), "success");
      router.push("/dashboard");
      emit("close");
    } else {
      alertStore.showAlert(
        t("loginFailed") + (response.message || t("unknownError")),
        "error"
      );
    }
  } catch (error) {
    alertStore.showAlert(t("loginError"), "error");
  }
};
</script>

<style scoped>
/* 可根据需要添加自定义样式 */
</style>

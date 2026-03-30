<template>
  <div class="relative">
    <div
      class="fixed left-0 right-0 top-0 z-20 h-16 border-b border-white/10 bg-black/80 backdrop-blur-2xl"
      :class="[modelValue ? 'lg:bg-black/80' : 'bg-black/72']"
    />

    <header
      class="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between text-white"
    >
      <div class="flex items-center">
        <div
          :class="[
            'h-full flex items-center justify-center transition-all duration-300 ease-in-out',
            sidebarStore.isOpen && !sidebarStore.isMobile ? 'w-64' : 'w-18',
          ]"
        >
          <NuxtLink
            to="/"
            :class="[
              'flex items-center justify-center font-black select-none transition-all duration-300 ease-in-out',
              sidebarStore.isOpen && !sidebarStore.isMobile
                ? 'h-11 rounded-full border border-white/10 bg-white/5 px-5 text-[1.05rem] tracking-[0.28em] text-white/92 backdrop-blur-xl'
                : 'h-11 w-11 rounded-2xl bg-white text-sm tracking-[0.18em] text-black shadow-[0_0_2px_rgb(255_255_255_/_0.4),inset_0_0_0_3px_rgb(7_7_10),inset_0_0_0_6px_var(--synull)]',
            ]"
          >
            {{
              sidebarStore.isOpen && !sidebarStore.isMobile ? "SYNULL" : "SN"
            }}
          </NuxtLink>
        </div>
        <button
          class="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-3 text-white/70 backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white"
          @click="toggleSidebar"
        >
          <Icon :name="sidebarIcon" class="h-6 w-6" />
        </button>
        <button
          :disabled="loading"
          class="ml-3 flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-3 text-white/70 backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          @click="refreshAll"
        >
          <Icon
            v-if="loading"
            name="solar:refresh-circle-bold-duotone"
            class="h-6 w-6 rotate-180 text-white/35 motion-safe:animate-spin"
          />
          <Icon
            v-else
            name="solar:refresh-square-line-duotone"
            class="h-6 w-6"
          />
        </button>
        <div class="ml-4 hidden text-lg font-semibold text-white/82 lg:block">
          {{ $t("dashboard") }}
        </div>
      </div>
      <div class="ml-auto mr-4 flex items-center space-x-4">
        <button
          @click="openLanguageModal"
          class="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2.5 text-white/70 backdrop-blur-xl transition duration-300 hover:bg-white/10 hover:text-white"
        >
          <Icon name="tabler:language" class="h-5 w-5" />
        </button>
        <span class="hidden text-sm text-white/65 sm:inline"
          >{{ $t("welcome") }} {{ userInfo?.user?.username || "" }}</span
        >
        <div class="relative">
          <USkeleton v-if="loading" class="h-8 w-8 rounded-full bg-white/10" />
          <img
            v-else-if="userInfo?.user?.email_md5"
            @click="toggleDropdown"
            :src="`https://cravatar.cn/avatar/${userInfo.user.email_md5}?d=https://cravatar.cn/wp-content/uploads/sites/9/2024/03/lgqsza1-2.png`"
            alt="用户头像"
            class="h-8 w-8 cursor-pointer rounded-full ring-2 ring-white/10 transition duration-300 hover:ring-white/20"
          />
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showDropdown"
              class="dashboard-panel absolute right-0 z-50 mt-3 w-56 rounded-2xl py-2"
            >
              <a
                href="#"
                class="flex items-center px-4 py-3 text-sm text-white/70 transition duration-300 hover:bg-white/6 hover:text-white"
              >
                <Icon
                  name="solar:user-circle-bold-duotone"
                  class="w-5 h-5 mr-3"
                />
                <span>{{ $t("personalProfile") }}</span>
              </a>
              <a
                href="#"
                class="flex items-center px-4 py-3 text-sm text-white/70 transition duration-300 hover:bg-white/6 hover:text-white"
              >
                <Icon
                  name="solar:safe-square-bold-duotone"
                  class="w-5 h-5 mr-3"
                />
                <span>{{ $t("securitySettings") }}</span>
              </a>
              <a
                href="#"
                @click.prevent="logout"
                class="flex items-center px-4 py-3 text-sm text-rose-300 transition duration-300 hover:bg-white/6 hover:text-white"
              >
                <Icon name="solar:logout-3-bold-duotone" class="w-5 h-5 mr-3" />
                <span>{{ $t("logout") }}</span>
              </a>
            </div>
          </transition>
        </div>
      </div>

      <Modal
        :show="showLanguageModal"
        :title="$t('selectLanguage')"
        :iconName="'tabler:language'"
        @close="showLanguageModal = false"
        @confirm="changeLanguage"
        :confirmText="$t('confirm')"
        :cancelText="$t('cancel')"
      >
        <div class="flex flex-col space-y-2">
          <label
            v-for="lang in availableLanguages"
            :key="lang.code"
            class="flex w-48 cursor-pointer items-center rounded-2xl px-3 py-2.5 text-sm transition duration-300"
            :class="
              selectedLanguage === lang.code
                ? 'border border-synull/30 bg-synull/16 text-white'
                : 'border border-transparent text-white/72 hover:bg-white/6 hover:text-white'
            "
          >
            <input
              type="radio"
              :value="lang.code"
              v-model="selectedLanguage"
              class="mr-2 custom-radio"
            />
            <span class="mr-2 text-base leading-none">{{ lang.flag }}</span>
            {{ lang.name }}
          </label>
        </div>
      </Modal>
    </header>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Modal from "./Modal.vue";
import {
  normalizeLocaleCode,
  persistLocaleCode,
} from "~/composables/useLocalePreference";
import { useSidebarStore } from "~/stores/sidebar";
import { useUserInfoStore } from "~/stores/userInfo";

const sidebarStore = useSidebarStore();
const userInfoStore = useUserInfoStore();
const { userInfo, loading } = storeToRefs(userInfoStore);
const router = useRouter();

defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const toggleSidebar = () => {
  sidebarStore.setIsOpen(!sidebarStore.isOpen);
};

const sidebarIcon = computed(() =>
  sidebarStore.isOpen
    ? "solar:send-square-line-duotone"
    : "solar:hamburger-menu-line-duotone"
);

const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = (event) => {
  if (!event.target.closest(".relative")) {
    showDropdown.value = false;
  }
};

const { locale } = useI18n();

const showLanguageModal = ref(false);
const selectedLanguage = ref(normalizeLocaleCode(locale.value));

const openLanguageModal = () => {
  showLanguageModal.value = true;
};

const availableLanguages = [
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", name: "繁體中文", flag: "🇨🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
];

const changeLanguage = () => {
  locale.value = persistLocaleCode(selectedLanguage.value);
  selectedLanguage.value = normalizeLocaleCode(locale.value);
  showLanguageModal.value = false;
};

watch(
  locale,
  (value) => {
    selectedLanguage.value = normalizeLocaleCode(value);
  },
  { immediate: true }
);

onMounted(async () => {
  locale.value = normalizeLocaleCode(locale.value);
  if (!userInfo.value) {
    await userInfoStore.fetchUserInfo();
  }

  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});

const refreshAll = async () => {
  try {
    await userInfoStore.fetchUserInfo();
    await refreshNuxtData();
  } catch (error) {
    console.error("刷新数据时发生错误", error);
  }
};

const logout = () => {
  clearAuthToken();
  userInfoStore.clearUserInfo();
  window.location.href =
    "/auth/login?redirect_uri=" + router.currentRoute.value.fullPath;
};
</script>

<style scoped>
.custom-radio {
  appearance: none;
  width: 0.75rem;
  height: 0.75rem;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 50%;
  transition: background-color 0.3s, border-color 0.3s;
  cursor: pointer;
}

.custom-radio:checked {
  background-color: var(--synull);
  border-color: var(--synull);
}

.custom-radio:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--ui-color-primary-300);
}

/* 可以添加以下样式来确保模态框显示在顶部 */
:deep(.modal-overlay) {
  z-index: 100;
}
</style>

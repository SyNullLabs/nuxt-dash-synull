<template>
  <div class="relative">
    <div
      class="fixed top-0 left-0 right-0 h-16 backdrop-blur-md z-20"
      :class="[
        modelValue ? 'bg-white' : 'bg-white/85',
        { 'lg:bg-white/85': modelValue },
      ]"
    ></div>

    <header
      class="fixed top-0 left-0 right-0 z-30 flex items-center justify-between text-gray-700 h-16"
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
              'flex items-center justify-center rounded-2xl transition-all duration-300 ease-in-out font-black select-none',
              sidebarStore.isOpen && !sidebarStore.isMobile
                ? 'h-16 px-4 text-2xl tracking-[0.28em] text-synull'
                : 'h-10 w-10 bg-synull text-sm tracking-[0.18em] text-white',
            ]"
          >
            {{
              sidebarStore.isOpen && !sidebarStore.isMobile ? "SYNULL" : "SN"
            }}
          </NuxtLink>
        </div>
        <button
          class="p-4 text-gray-500 flex items-center justify-center"
          @click="toggleSidebar"
        >
          <Icon :name="sidebarIcon" class="h-8 w-8 text-gray-600" />
        </button>
        <button
          :disabled="loading"
          class="p-4 text-gray-500 flex items-center justify-center"
          @click="refreshAll"
        >
          <Icon
            v-if="loading"
            name="solar:refresh-circle-bold-duotone"
            class="h-8 w-8 text-gray-300 motion-safe:animate-spin rotate-180"
          />
          <Icon
            v-else
            name="solar:refresh-square-line-duotone"
            class="h-8 w-8 text-gray-600"
          />
        </button>
        <div class="text-lg font-semibold hidden lg:block ml-4">
          {{ $t("dashboard") }}
        </div>
      </div>
      <div class="flex items-center space-x-4 ml-auto mr-4">
        <button
          @click="openLanguageModal"
          class="p-2 rounded-md hover:bg-gray-100 transition duration-300 flex items-center justify-center"
        >
          <Icon name="tabler:language" class="w-6 h-6 text-gray-600" />
        </button>
        <span class="hidden sm:inline"
          >{{ $t("welcome") }} {{ userInfo?.user?.username || "" }}</span
        >
        <div class="relative">
          <USkeleton v-if="loading" class="h-8 w-8 rounded-full" />
          <img
            v-else-if="userInfo?.user?.email_md5"
            @click="toggleDropdown"
            :src="`https://cravatar.cn/avatar/${userInfo.user.email_md5}?d=https://cravatar.cn/wp-content/uploads/sites/9/2024/03/lgqsza1-2.png`"
            alt="用户头像"
            class="h-8 w-8 rounded-full cursor-pointer"
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
              class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 z-50"
            >
              <a
                href="#"
                class="flex items-center px-4 py-3 text-sm text-gray-600 transition duration-300 hover:bg-synull-100 hover:text-synull-800"
              >
                <Icon
                  name="solar:user-circle-bold-duotone"
                  class="w-5 h-5 mr-3"
                />
                <span>{{ $t("personalProfile") }}</span>
              </a>
              <a
                href="#"
                class="flex items-center px-4 py-3 text-sm text-gray-600 transition duration-300 hover:bg-synull-100 hover:text-synull-800"
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
                class="flex items-center px-4 py-3 text-sm text-red-600 transition duration-300 hover:bg-synull-100 hover:text-synull-800"
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
            class="flex items-center p-2 rounded-md transition duration-300 w-48 cursor-pointer"
            :class="
              selectedLanguage === lang.code
                ? 'bg-synull-100 text-synull-700'
                : 'hover:bg-gray-100'
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Modal from "./Modal.vue";
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
const selectedLanguage = ref(locale.value);

const openLanguageModal = () => {
  showLanguageModal.value = true;
};

const availableLanguages = [
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", name: "繁體中文", flag: "🇨🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
];

const changeLanguage = () => {
  locale.value = selectedLanguage.value;
  showLanguageModal.value = false;
  document.cookie = `i18n_redirected=${selectedLanguage.value}; max-age=31536000; path=/`;
};

onMounted(async () => {
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
  border: 1px solid #d1d5db; /* gray-300 */
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

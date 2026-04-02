<template>
  <div>
    <!-- 添加4个小卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="dashboard-panel cursor-pointer rounded-[1.75rem] border-l-4 px-5 py-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-white/14"
        :class="card.borderColor"
      >
        <div class="flex items-center justify-between">
          <div>
            <h6 class="mb-2 text-sm text-white/60">
              <USkeleton v-if="loading" class="h-5 w-[100px] rounded-full" />
              <span v-else>{{ $t(card.title) }}</span>
            </h6>
            <h4 class="text-xl text-white">
              <USkeleton
                v-if="loading"
                class="h-[30px] w-[50px] rounded-full"
              />
              <span v-else>{{ card.value }}</span>
            </h4>
          </div>
          <Icon
            v-if="!loading"
            :name="card.icon"
            class="text-5xl"
            :class="card.iconColor"
          />
          <USkeleton v-else class="h-[50px] w-[50px] rounded-xl" />
        </div>
      </div>
    </div>

    <!-- 现有的用户信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      <div
        v-if="loading"
        class="dashboard-panel overflow-hidden rounded-[1.75rem]"
      >
        <USkeleton class="h-[300px] w-full rounded-xl" />
      </div>
      <div
        v-else-if="userInfo"
        class="dashboard-panel relative overflow-hidden rounded-[1.75rem] bg-cover bg-center"
        :style="{
          backgroundImage: `url(https://myhkw.cn/open/img/bing?key=a9eaebc74a264ca985d3c0a31ab84a41)`,
        }"
      >
        <div
          class="flex h-[300px] flex-col justify-between rounded-[1.75rem] bg-black/42 backdrop-blur-md"
        >
          <div
            class="ml-4 mt-4 self-start rounded-full border border-white/10 bg-black/45 backdrop-blur-xl"
          >
            <div class="flex items-center px-3 py-1.5 text-white/72">
              <Icon name="solar:crown-line-bold-duotone" class="mr-1 text-xl" />
              <h6 class="mb-0">
                <USkeleton v-if="loading" class="h-5 w-[100px] rounded-xl" />
                <span v-else class="text-sm">{{ $t("defaultGroup") }}</span>
              </h6>
            </div>
          </div>
        </div>
        <div
          class="absolute bottom-0 w-full rounded-b-[1.75rem] border-t border-white/10 bg-black/65 p-4 backdrop-blur-2xl"
        >
          <div class="w-full flex items-center">
            <USkeleton v-if="loading" class="mr-3 h-16 w-16 rounded-full" />
            <img
              v-else
              @click="router.push('/user/profile')"
              :src="
                'https://cravatar.cn/avatar/' +
                userInfo.user?.email_md5 +
                '?d=https://cravatar.cn/wp-content/uploads/sites/9/2024/03/lgqsza1-2.png'
              "
              class="w-16 h-16 rounded-full mr-3 cursor-pointer"
              alt="用户头像"
            />
            <div>
              <h5 class="mb-1 text-lg font-semibold text-white">
                <USkeleton v-if="loading" class="h-5 w-[150px] rounded-xl" />
                <span v-else>
                  {{ userInfo.client.username }}
                  <span
                    class="ml-2 rounded-full border border-synull/30 bg-synull/18 px-2 py-1 text-xs text-synull-100"
                    >ID:{{ userInfo.user.id }}</span
                  >
                </span>
              </h5>
              <p class="mb-1 text-white/60">
                <USkeleton v-if="loading" class="h-5 w-[200px] rounded-xl" />
                <span v-else>{{ userInfo.client.email }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userInfoStore = ref(null);

const loading = ref(true);
const userInfo = ref(null);
const cards = ref([0, 0, 0, 0]);

onMounted(async () => {
  // 异步导入 userInfoStore
  const { useUserInfoStore } = await import("~/stores/userInfo");
  userInfoStore.value = useUserInfoStore();

  setTimeout(async () => {
    await userInfoStore.value.fetchUserInfo();
    userInfo.value = userInfoStore.value.userInfo;
    loading.value = userInfoStore.value.loading;
      cards.value = [
        {
          title: "productQuantity",
          value: userInfo.value?.host ?? 0,
          icon: "solar:box-bold-duotone",
          borderColor: "border-blue-500",
          iconColor: "text-blue-500",
        },
        {
          title: "unpaidOrders",
          value: userInfo.value?.order_count ?? 0,
          icon: "solar:cart-large-bold-duotone",
          borderColor: "border-yellow-500",
          iconColor: "text-yellow-500",
        },
        {
          title: "pendingTickets",
          value: userInfo.value?.ticket_count ?? 0,
          icon: "solar:clipboard-text-bold-duotone",
          borderColor: "border-green-500",
          iconColor: "text-green-500",
        },
        {
          title: "accountBalance",
          value: userInfo.value?.client?.credit ?? "0.00",
          icon: "solar:wallet-bold-duotone",
          borderColor: "border-synull",
          iconColor: "text-synull",
      },
    ];
  }, 100);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

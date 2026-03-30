<template>
  <aside
    v-show="!sidebarStore.isMobile || sidebarStore.isOpen"
    v-auto-animate
    :class="[
      'fixed left-0 top-16 z-20 flex h-screen flex-col justify-between border-r border-white/10 bg-black/62 text-white/72 backdrop-blur-2xl transition-all duration-300 ease-in-out',
      sidebarStore.isOpen ? 'w-64' : 'w-18',
      sidebarStore.isMobile && !sidebarStore.isOpen ? 'hidden' : '',
    ]"
  >
    <!-- 导航菜单 -->
    <nav class="m-3 flex-grow" v-auto-animate>
      <ul class="space-y-1">
        <li
          v-for="(item, index) in menuItems"
          :key="index"
          class="relative group"
        >
          <NuxtLink
            @click="handleClick(item, index)"
            :to="item.href"
            :class="[
              'flex items-center justify-between rounded-2xl py-4 transition duration-300 ease-out hover:bg-white/7 hover:text-white',
              sidebarStore.currentRoute === item.href
                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'text-white/72',
              sidebarStore.isOpen ? 'px-6' : 'px-4',
            ]"
          >
            <div class="flex items-center">
              <Icon :name="item.icon" class="w-5 h-5 flex-shrink-0 mr-3" />
              <span
                v-if="sidebarStore.isOpen"
                class="text-sm whitespace-nowrap"
                >{{ $t(item.label) }}</span
              >
            </div>
            <div class="flex items-center">
              <Icon
                v-if="sidebarStore.isOpen && item.children"
                :name="
                  sidebarStore.openSubmenus.includes(index)
                    ? 'heroicons:chevron-up'
                    : 'heroicons:chevron-down'
                "
                class="w-4 h-4 transition-transform duration-300"
                :class="{
                  'transform rotate-180':
                    sidebarStore.openSubmenus.includes(index),
                }"
              />
            </div>
          </NuxtLink>
          <!-- 二级菜单 -->
          <div
            v-if="item.children && sidebarStore.isOpen"
            class="overflow-hidden transition-all duration-300 ease-in-out"
            :style="{
              maxHeight: sidebarStore.openSubmenus.includes(index)
                ? `${item.children.length * 60}px`
                : '0px',
            }"
          >
            <ul class="px-3 py-1 rounded space-y-1">
              <li
                v-for="(child, childIndex) in item.children"
                :key="childIndex"
              >
                <NuxtLink
                  :to="child.href"
                  :class="[
                    'flex items-center rounded-xl p-2 pl-6 transition duration-300 ease-out hover:bg-white/7 hover:text-white',
                    sidebarStore.currentRoute === child.href
                      ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'text-white/68',
                  ]"
                >
                  <Icon
                    :name="child.icon"
                    class="w-5 h-5 flex-shrink-0 mr-3 opacity-80"
                  />
                  <span class="text-sm whitespace-nowrap">{{
                    $t(child.label)
                  }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
          <!-- 悬停弹出窗口 -->
          <div
            v-if="!sidebarStore.isOpen && !sidebarStore.isMobile"
            class="absolute left-0 top-0 z-10 h-full w-64 -translate-x-[100%] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.45)] invisible backdrop-blur-xl transition-all duration-300 ease-in-out group-hover:visible group-hover:translate-x-0 group-hover:opacity-100"
          >
            <NuxtLink
              :to="item.href"
              class="flex items-center px-4 py-4 transition-colors hover:bg-white/6"
              :class="
                sidebarStore.currentRoute === item.href
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-white/72'
              "
            >
              <span class="ml-16 text-sm">{{ $t(item.label) }}</span>
            </NuxtLink>
          </div>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSidebarStore } from "~/stores/sidebar"; // 引入 Pinia store

const sidebarStore = useSidebarStore(); // 使用 Pinia store
const route = useRoute();
const router = useRouter();
const menuItems = [
  { href: "/", icon: "solar:home-2-bold-duotone", label: "home" },
  { href: "/buy", icon: "solar:cart-bold-duotone", label: "buy" },
  {
    href: "javascript:void(0)",
    icon: "solar:widget-2-bold-duotone",
    label: "productManagement",
    children: [
      {
        href: "/products/cvm",
        icon: "solar:cloud-bolt-minimalistic-line-duotone",
        label: "cloudVirtualMachine",
      },
      {
        href: "/products/tcvm",
        icon: "solar:cloud-storm-line-duotone",
        label: "trafficCloudVirtualMachine",
      },
      {
        href: "/products/host",
        icon: "solar:global-line-duotone",
        label: "virtualHosts",
      },
    ],
  },
  // 添加更多菜单项...
];

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // 假设小于 1024px 为移动端
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

const handleClick = (item, index) => {
  if (item.children) {
    sidebarStore.toggleSubmenu(index);
  } else {
    // 使用路由进行导航
    router.push(item.href);
  }
};

watch(
  () => route.path,
  (newPath) => {
    sidebarStore.setCurrentRoute(newPath);
  }
);

onMounted(() => {
  sidebarStore.setCurrentRoute(route.path);
});
</script>

<style scoped>
aside {
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: 20;
}

.absolute {
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  z-index: -10;
}

.overflow-hidden {
  transition: max-height 0.3s ease-in-out;
}

/* 添加新的动画样式 */
.group {
  perspective: 1000px;
}

.group:hover .absolute {
  opacity: 1;
  visibility: visible;
  animation: pop-out 0.3s ease-out forwards;
}

@keyframes pop-out {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>

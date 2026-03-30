<template>
    <div class="mb-4">
        <nav class="text-gray-300 text-sm flex flex-row items-center m-0 gap-1">
            <router-link to="/" class="flex flex-row items-center">
                <Icon name="solar:home-2-bold-duotone" class="text-yunyoo text-xl" />
            </router-link>
            <Icon name="solar:alt-arrow-right-outline" class="text-gray-500 text-lg" />
            <span class="flex flex-row items-center gap-1 text-gray-500">{{ t('buy') }}</span>
        </nav>
    </div>
    <div class="flex flex-col gap-4 bg-white rounded-xl shadow-xl shadow-gray-100 p-4">
        <div class="product-header">
            <Icon name="" class="text-yunyoo" />
            <span class="text-yunyoo text-xl font-medium">产品类型</span>
        </div>
        <div class="flex gap-4">
            <div 
                v-for="product in products" 
                :key="product.id" 
                @click="navigateTo(product.route)" 
                :class="['product-item w-[321px] rounded-xl p-2 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 ease-in-out', product.bgClass, product.hoverClass]"
            >
            <div 
                    class="flex items-start p-2 bg-primary text-white rounded cursor-pointer hover:bg-primary-dark">
                    <div class="flex flex-col">
                        <span class="text-2xl mb-1">{{ product.name }}</span>
                        <span class="text-sm">{{ product.description }}</span>
                    </div>
                    <Icon v-if="showInfo" name="fa:circle-info" class="ml-1" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const products = ref([
    { id: 1, name: 'CVM', description: '经典型云服务器', route: '/buy/1', bgClass: 'bg-yunyoo', hoverClass: 'hover:bg-yunyoo' },
    { id: 5, name: 'TCVM', description: '流量型云服务器', route: '/buy/5', bgClass: 'bg-gray-100', hoverClass: 'hover:bg-yunyoo' },
    { id: 4, name: 'HOST', description: '云虚拟主机', route: '/buy/4', bgClass: 'bg-gray-100', hoverClass: 'hover:bg-yunyoo' }
]);
</script>

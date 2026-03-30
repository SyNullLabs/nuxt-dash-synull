<template>

    <div class="mb-4">
        <nav class="text-gray-300 text-sm flex flex-row items-center m-0 gap-1">
            <router-link :to="home.route" class="flex flex-row items-center">
                <Icon :name="home.icon" :class="home.class" />
            </router-link>
            <Icon name="solar:alt-arrow-right-outline" class="text-gray-500 text-lg" />
            <span v-for="(item, index) in items" :key="index" class="flex flex-row items-center gap-1">
                <span :class="item.class">{{ item.label }}</span>
                <Icon v-if="index < items.length - 1" name="solar:alt-arrow-right-outline"
                    class="text-gray-500 text-lg ml" />
            </span>
        </nav>
    </div>
    <div class="flex flex-row justify-between mb-4">
        <div class="w-full pr-2">
            <NSelect v-if="!loading" v-model:value="selectedStatus" :options="selectStatus" option-label="name" filter
                :placeholder="$t('selectStatus')" :max-selected-labels="3" class="w-full md:w-80" multiple />
        </div>
        <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center p-2.5 rounded-l-lg">
                <Icon name="solar:minimalistic-magnifer-bold-duotone" class="text-yunyoo w-5 h-5" />
            </span>
            <input v-model="searchQuery"
                class="appearance-none border rounded-lg w-full py-2.5 pl-10 pr-3 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-yunyoo-200 bg-white"
                :placeholder="t('searchProducts')">
        </div>
    </div>
    <div v-if="!loading && paginatedProducts.length > 0"
        class="rounded-xl shadow-xl shadow-gray-100 mb-4 overflow-hidden bg-white">
        <div class="flex flex-col rounded-xl p-1 gap-1">
            <div v-for="(item, index) in paginatedProducts" :key="index">
                <div>
                    <div
                        class="flex flex-col sm:flex-row sm:items-center gap-2 border border-yunyoo-200 rounded-lg p-2 w-full">
                        <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-2 p-2 w-full">
                            <div class="flex flex-col whitespace-nowrap">
                                <span class="font-medium text-yunyoo-800 text-sm flex items-center">
                                    <Icon name="solar:bolt-circle-bold-duotone" class="text-gray-500 mr-1 text-lg">
                                    </Icon>{{ item.domain }}
                                </span>
                                <div class="text-lg font-medium mt-1 text-gray-700 whitespace-nowrap">
                                    {{ item.productName }}
                                    <span class="px-2 py-1 border rounded-full text-xs select-none"
                                        :class="statusColors[item.domainstatus].class">
                                        {{ $t(item.domainstatus) }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex flex-wrap justify-center grow max-w-5xl">
                                <div class="relative w-1/2 sm:w-1/4">
                                    <client-only>
                                        <LineChart :chart-data="chartDataCPU" :options="chartOptions"
                                            class="h-14 w-full" />
                                    </client-only>
                                    <span
                                        class="absolute inset-x-0 top-1 flex items-center justify-center text-green-500 opacity-30 text-xl z-0 font-black whitespace-nowrap select-none pointer-events-none">
                                        {{ $t('CPU Usage') }}
                                    </span>
                                </div>
                                <div class="relative w-1/2 sm:w-1/4">
                                    <LineChart :chart-data="chartDataMemory" :options="chartOptions"
                                        class="h-14 w-full" />
                                    <span
                                        class="absolute inset-x-0 top-1 flex items-center justify-center text-blue-500 opacity-30 text-xl z-0 font-black whitespace-nowrap select-none pointer-events-none">
                                        {{ $t('Memory Usage') }}
                                    </span>
                                </div>
                                <div class="relative w-1/2 sm:w-1/4">
                                    <LineChart :chart-data="chartDataDisk" :options="chartOptions"
                                        class="h-14 w-full" />
                                    <span
                                        class="absolute inset-x-0 top-1 flex items-center justify-center text-purple-500 opacity-30 text-xl z-0 font-black whitespace-nowrap select-none pointer-events-none">
                                        {{ $t('Disk Usage') }}
                                    </span>
                                </div>
                                <div class="relative w-1/2 sm:w-1/4">
                                    <LineChart :chart-data="chartDataNetwork" :options="chartOptions"
                                        class="h-14 w-full" />
                                    <span
                                        class="absolute inset-x-0 top-1 flex items-center justify-center text-orange-500 opacity-30 text-xl z-0 font-black whitespace-nowrap select-none pointer-events-none">
                                        {{ $t('Network Usage') }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex flex-row items-center gap-2 text-2xl text-gray-500">
                                <Icon name="solar:info-circle-line-duotone" :label="$t('info')" />
                                <Icon name="solar:power-bold-duotone" :label="$t('power')" />
                                <Icon name="solar:link-minimalistic-2-bold-duotone" :label="$t('VNC')" />
                                <Icon name="solar:eye-bold-duotone" :label="$t('view')" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="!loading"
        class="flex items-center justify-center py-4 text-gray-500 rounded-xl shadow-xl shadow-gray-100 mb-4 bg-white">
        <span class="text-sm"><i>{{ $t('noAvailableOptions') }}</i></span>
    </div>
    <div v-else
        class="flex items-center justify-center py-4 text-gray-500 rounded-xl shadow-xl shadow-gray-100 mb-4 bg-white">
        <span class="text-sm"><i>{{ $t('loading') }}</i></span>
    </div>
    <div class="flex flex-row justify-between">
        <div>
            <n-pagination v-if="!loading" v-model:page="first" :page-size="5"
                :page-count="Math.ceil(filteredProducts.length / 5)" @update:page="onPage"
                class="mb-4 overflow-hidden shadow-xl shadow-gray-100 bg-white border border-yunyoo-200 custom-paginator rounded-xl" />
        </div>
    </div>
    <div class="flex flex-row justify-between">
        {{ products.value }}
    </div>

</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from 'vue-i18n';
import { useProductsListStore } from '@/stores/products/list';

const { t } = useI18n();
const loading = ref(true);
const productsStore = useProductsListStore();
const products = ref([]);

// 定义一个初始的空图表数据结构
const emptyChartData = {
    labels: [],
    datasets: [{
        label: '',
        data: [],
        fill: false,
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0,
    }]
};

// 使用空数据结构初始化图表数
const chartDataCPU = ref(emptyChartData);
const chartDataMemory = ref(emptyChartData);
const chartDataDisk = ref(emptyChartData);
const chartDataNetwork = ref(emptyChartData);

const updateChartData = () => {
    const labels = Array.from({ length: 7 }, (_, i) => `${i + 1}h`);
    const generateRandomData = () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));

    const createDataset = (color) => ({
        labels: labels,
        datasets: [{
            label: t('Usage'),
            data: generateRandomData(),
            fill: true,
            borderColor: color,
            borderWidth: 2,
            tension: 0.4,
            backgroundColor: `${color}20`,
            pointStyle: false,
        }]
    });

    // 为每个图表设置不同的颜色
    chartDataCPU.value = createDataset('#10B981');      // 绿色
    chartDataMemory.value = createDataset('#3B82F6');   // 蓝色
    chartDataDisk.value = createDataset('#8B5CF6');     // 紫色
    chartDataNetwork.value = createDataset('#F59E0B');  // 橙色
};

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            display: false,
            grid: {
                display: false
            }
        },
        y: {
            display: false, // 改为 true 显示 y 轴
            min: 0,
            max: 100,
            ticks: {
                stepSize: 20, // y 轴刻度步长
                callback: function (value) {
                    return value + '%' // 添加百分号
                }
            }
        }
    },
    elements: {
        line: {
            tension: 0.4
        },
        point: {
            radius: 0 // 隐藏数据点
        }
    },
    interaction: {
        intersect: false, // 不需要精确指向数据点
        mode: 'index' // 显示垂直线上的所有数据点
    },
    hover: {
        mode: 'index',
        intersect: false
    },
    layout: {
        padding: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    }
});

onMounted(async () => {
    try {
        await productsStore.fetchProductsList();
        products.value = productsStore.parseProductsToArray();
        console.log('产品列表:', products.value);
        updateChartData(); // 在数据加载完成后更新图表数据
    } catch (error) {
        console.error('获取产品列表时出错:', error);
    } finally {
        loading.value = false;
    }
});

const home = ref({
    icon: 'solar:home-2-bold-duotone',
    route: '/',
    class: 'text-yunyoo text-xl'
});
const items = ref([
    { label: t('productManagement'), class: 'text-gray-500' },
    { label: t('cloudVirtualMachine'), class: 'text-gray-500' }
]);

const searchQuery = ref('')

const filteredProducts = computed(() => {
    if (!Array.isArray(products.value)) {
        console.warn('products.value 不是数组:', products.value);
        return [];
    }
    const query = searchQuery.value.toLowerCase();
    const selectedStatuses = selectedStatus.value || [];

    return products.value.filter(product => {
        const matchesQuery = product.productName.toLowerCase().includes(query) ||
            product.domain.toLowerCase().includes(query) ||
            product.dedicatedip.toLowerCase().includes(query);

        const matchesStatus = selectedStatuses.length === 0 ||
            selectedStatuses.some(status => product.domainstatus === status);

        return matchesQuery && matchesStatus;
    });
});


const first = ref(1); // 将初始页码改为1

const paginatedProducts = computed(() => {
    const pageSize = 5;
    const start = (first.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredProducts.value.slice(start, end);
});


const onPage = (page) => {
    first.value = page;
};

watch(searchQuery, () => {
    first.value = 0; // 重置分页到第一页
});

const selectedStatus = ref();
const selectStatus = ref([
    { label: t('Pending'), value: 'Pending' },
    { label: t('Active'), value: 'Active' },
    { label: t('Cancelled'), value: 'Cancelled' },
    { label: t('Fraud'), value: 'Fraud' },
    { label: t('Deleted'), value: 'Deleted' },
    { label: t('Suspended'), value: 'Suspended' }
]);


const statusColors = {
    "Pending": { "name": "待开通", "class": "bg-orange-100 border-orange-200/80 text-orange-500" },
    "Active": { "name": "已激活", "class": "bg-green-100 border-green-200/80 text-green-500" },
    "Cancelled": { "name": "被取消", "class": "bg-gray-100 border-gray-200/80 text-gray-500" },
    "Fraud": { "name": "有欺诈", "class": "bg-red-100 border-red-200/80 text-red-500" },
    "Deleted": { "name": "被删除", "class": "bg-zinc-100 border-zinc-200/80 text-zinc-500" },
    "Suspended": { "name": "已暂停", "class": "bg-yellow-100 border-yellow-200/80 text-yellow-500" }
};


</script>
<style scoped></style>

import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { ref } from "vue";

export const useProductsListStore = defineStore("productsList", () => {
  const products = ref([]);
  const loading = ref(true);
  const fetchProductsList = async (groupid = null) => {
    const router = useRouter();
    const token = localStorage.getItem("jwt");
    loading.value = true;

    if (!token) {
      console.log("未找到token");
      alertStore.showAlert("请先登录", "error");
      router.push({
        path: "/auth/login",
        query: { redirect_uri: router.currentRoute.value.fullPath },
      });
      return;
    }

    try {
      const params = {};
      if (groupid !== null && groupid !== undefined) {
        params.groupid = groupid;
      }

      const data = await $fetch("/api/products/list", {
        params,
        headers: {
          Authorization: token,
        },
      });

      if (!data || !data.success) {
        throw new Error(data?.message || t("invalidResponseData"));
      }

      products.value = {
        ...data.data,
      };
    } catch (error) {
      console.error("获取产品列表时发生错误", error);
    } finally {
      loading.value = false;
    }
  };

  const parseProductsToArray = () => {
    if (!products.value || !products.value.data || !products.value.data.list) {
      return [];
    }
    console.log(products.value.data.list);
    return products.value.data.list.map(product => ({
      id: product.id,
      domain: product.domain,
      domainstatus: product.domainstatus,
      productName: product.productname,
      dedicatedip: product.dedicatedip,
      status: product.domainstatus,
      statusDesc: product.domainstatus_desc,
      price: product.price_desc,
      nextDueDate: new Date(product.nextduedate * 1000).toLocaleDateString(),
      // 根据需要添加更多字段
    }));
  };

  return { 
    products, 
    loading, 
    fetchProductsList, 
    parseProductsToArray  // 确保这个函数被返回
  };
});

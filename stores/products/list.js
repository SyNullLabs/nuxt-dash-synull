import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { buildLoginRedirectLocation } from "~/composables/useSession";
import { useAlertStore } from "~/stores/alert";

export const useProductsListStore = defineStore("productsList", () => {
  const products = ref([]);
  const loading = ref(false);
  const router = useRouter();
  const alertStore = useAlertStore();
  const api = useApiClient();

  const formatTimestamp = (value) => {
    const timestamp = Number(value);

    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return "-";
    }

    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const redirectToLogin = () => {
    clearAuthToken();
    router.push(buildLoginRedirectLocation(router.currentRoute.value.fullPath));
  };

  const fetchProductsList = async (groupid = null) => {
    const token = getAuthToken();

    if (!token) {
      alertStore.showAlert("请先登录", "error");
      redirectToLogin();
      return;
    }

    loading.value = true;

    try {
      const response = await api("/products/hosts", {
        method: "GET",
        query:
          groupid !== null && groupid !== undefined ? { groupid } : undefined,
      });

      if (!response?.success) {
        throw new Error(response?.message || "获取产品列表失败");
      }

      products.value = response.data;
    } catch (error) {
      console.error("获取产品列表时发生错误", error);
      alertStore.showAlert(error.message || "获取产品列表失败", "error");

      if (error?.statusCode === 401 || error?.response?.status === 401) {
        redirectToLogin();
      }
    } finally {
      loading.value = false;
    }
  };

  const parseProductsToArray = () => {
    if (!products.value?.data?.list) {
      return [];
    }

    return products.value.data.list.map((product) => ({
      id: product.id,
      domain: product.domain || product.name || `#${product.id}`,
      domainstatus: product.domainstatus,
      productName: product.productname || product.name || `#${product.id}`,
      dedicatedip: product.dedicatedip || "",
      status: product.domainstatus,
      statusDesc: product.domainstatus_desc,
      price: product.price_desc,
      nextDueDate: formatTimestamp(product.nextduedate),
      apiType: product.api_type,
      type: product.type,
      zjmfApiId: product.zjmf_api_id,
      dcimid: product.dcimid,
      raw: product,
    }));
  };

  return {
    products,
    loading,
    fetchProductsList,
    parseProductsToArray,
  };
});

import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { buildLoginRedirectLocation } from "~/composables/useSession";
import { useAlertStore } from "~/stores/alert";

export const useUserInfoStore = defineStore("userInfo", () => {
  const userInfo = ref(null);
  const loading = ref(false);
  const router = useRouter();
  const alertStore = useAlertStore();
  const api = useApiClient();

  const redirectToLogin = () => {
    clearAuthToken();
    userInfo.value = null;
    router.push(buildLoginRedirectLocation(router.currentRoute.value.fullPath));
  };

  const fetchUserInfo = async () => {
    const token = getAuthToken();

    if (!token) {
      redirectToLogin();
      return null;
    }

    loading.value = true;

    try {
      const response = await api("/dash/user-info", {
        method: "GET",
      });

      if (!response?.success) {
        alertStore.showAlert(response?.message || "获取用户信息失败", "error");
        redirectToLogin();
        return null;
      }

      userInfo.value = response.data;
      return response.data;
    } catch (error) {
      console.error("获取用户信息时发生错误", error);
      alertStore.showAlert("获取用户信息失败，请稍后再试", "error");
      redirectToLogin();
      return null;
    } finally {
      loading.value = false;
    }
  };

  const clearUserInfo = () => {
    userInfo.value = null;
  };

  return {
    userInfo,
    loading,
    fetchUserInfo,
    clearUserInfo,
  };
});

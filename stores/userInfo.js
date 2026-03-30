import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { ref } from 'vue';

export const useUserInfoStore = defineStore("userInfo", () => {
    const userInfo = ref(null);
    const loading = ref(true);

    const fetchUserInfo = async () => {
        const router = useRouter();
        const token = localStorage.getItem("jwt");
        loading.value = true;

        try {
            const { data } = await useFetch("/api/dash/UserInfo", {
                headers: {
                    Authorization: token,
                },
                lazy: true,
                server: false,
            });

            if (!data.value || !data.value.success) {
                throw new Error(data.value?.message || t("invalidResponseData"));
            }

            if (data.value.success === false) {
                const redirectToLogin = (router) => {
                    router.push({
                        path: "/auth/login",
                        query: { redirect_uri: router.currentRoute.value.fullPath },
                    });
                };
            }

            userInfo.value = {
                ...data.value.data
            };

        } catch (error) {
            console.error(t("fetchUserInfoFailed"), error);
            redirectToLogin(router);
        } finally {
            loading.value = false;
        }
    };

    return { userInfo, loading, fetchUserInfo };
});

import { defineStore } from "pinia";
import { ref } from "vue"; // 确保引入 ref
import cookie from "js-cookie"; // 确保引入 cookie 库

export const useAffStore = defineStore("aff", () => {
    const aff = ref(null);

    if (typeof window !== 'undefined') { // 检查 window 是否存在
        const urlParams = new URLSearchParams(window.location.search);
        const affValue = urlParams.get('aff');

        if (affValue) {
            localStorage.setItem("aff", affValue);
            cookie.set("aff", affValue);
            aff.value = affValue;
        }
    }

    return aff;
});
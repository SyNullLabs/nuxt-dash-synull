import { defineStore } from "pinia";

export const useAlertStore = defineStore("alert", {
  state: () => ({
    show: false,
    message: "",
    type: "info",
    timeout: 3000,
  }),
  actions: {
    showAlert(message, type = "info", timeout = 3000) {
      console.log("showAlert 被调用:", message, type, timeout); // 添加这行
      this.show = true;
      this.message = message;
      this.type = type;
      this.timeout = timeout;

      setTimeout(() => {
        this.hideAlert();
      }, this.timeout);
    },
    hideAlert() {
      console.log("hideAlert 被调用"); // 添加这行
      this.show = false;
    },
  },
});

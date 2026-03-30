import { useToast } from "#imports";
import { defineStore } from "pinia";

const TOAST_STYLES = {
  success: {
    color: "success",
    icon: "solar:smile-circle-bold-duotone",
  },
  error: {
    color: "error",
    icon: "solar:confounded-circle-bold-duotone",
  },
  info: {
    color: "info",
    icon: "solar:info-circle-bold-duotone",
  },
};

export const useAlertStore = defineStore("alert", () => {
  const toast = useToast();

  const showAlert = (message, type = "info", timeout = 3000) => {
    const toastStyle = TOAST_STYLES[type] || TOAST_STYLES.info;

    toast.add({
      title: message,
      color: toastStyle.color,
      icon: toastStyle.icon,
      duration: timeout,
    });
  };

  const hideAlert = () => {
    toast.clear();
  };

  return {
    hideAlert,
    showAlert,
  };
});

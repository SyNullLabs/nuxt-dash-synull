import { useState } from "#imports";

export const useAuthMethods = () => {
  const methods = useState("auth-methods", () => null);
  const isLoading = useState("auth-methods-loading", () => false);
  const hasLoaded = useState("auth-methods-loaded", () => false);

  const loadAuthMethods = async () => {
    if (!process.client || isLoading.value || hasLoaded.value) {
      return;
    }

    isLoading.value = true;

    try {
      const response = await $fetch("/api/auth/methods");
      methods.value = response.methods || null;
      hasLoaded.value = true;
    } catch (error) {
      console.error("[auth-methods] Failed to load auth method config", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    hasLoaded,
    isLoading,
    loadAuthMethods,
    methods,
  };
};

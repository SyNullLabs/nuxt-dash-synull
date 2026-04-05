import { useState } from "#imports";

export const useAuthMethods = () => {
  const methods = useState("auth-methods", () => null);
  const setsaler = useState("auth-setsaler", () => false);
  const saler = useState("auth-saler", () => []);
  const isAff = useState("auth-is-aff", () => false);
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
      setsaler.value = response.setsaler || false;
      saler.value = response.saler || [];
      isAff.value = response.isAff || false;
      hasLoaded.value = true;
    } catch (error) {
      console.error("[auth-methods] Failed to load auth method config", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    hasLoaded,
    isAff,
    isLoading,
    loadAuthMethods,
    methods,
    saler,
    setsaler,
  };
};

import { onBeforeUnmount, ref, watch } from "vue";

export const useTurnstileChallenge = () => {
  const token = ref("");
  const isOpen = ref(false);
  const nonce = ref(0);

  let pendingPromise = null;
  let resolvePending = null;
  let rejectPending = null;

  const clearPending = () => {
    pendingPromise = null;
    resolvePending = null;
    rejectPending = null;
  };

  const reset = () => {
    token.value = "";
    isOpen.value = false;
    nonce.value += 1;
    clearPending();
  };

  const ensureToken = () => {
    if (token.value) {
      return Promise.resolve(token.value);
    }

    if (pendingPromise) {
      return pendingPromise;
    }

    isOpen.value = true;
    pendingPromise = new Promise((resolve, reject) => {
      resolvePending = resolve;
      rejectPending = reject;
    });

    return pendingPromise;
  };

  watch(token, (nextToken) => {
    if (!nextToken || !resolvePending) {
      return;
    }

    isOpen.value = false;

    const resolve = resolvePending;
    clearPending();
    resolve(nextToken);
  });

  onBeforeUnmount(() => {
    if (rejectPending) {
      rejectPending(new Error("Turnstile challenge cancelled"));
    }

    clearPending();
  });

  return {
    token,
    isOpen,
    nonce,
    ensureToken,
    reset,
  };
};


import { onBeforeUnmount, ref, watch } from "vue";

const TURNSTILE_CANCELLED_ERROR = "Turnstile challenge cancelled";

export const useTurnstileChallenge = () => {
  const token = ref("");
  const isOpen = ref(false);
  const nonce = ref(0);
  const activeSlot = ref("default");

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
    activeSlot.value = "default";
    nonce.value += 1;
    clearPending();
  };

  const cancel = () => {
    const reject = rejectPending;

    reset();

    if (reject) {
      reject(new Error(TURNSTILE_CANCELLED_ERROR));
    }
  };

  const ensureToken = (slot = "default") => {
    if (token.value) {
      return Promise.resolve(token.value);
    }

    if (pendingPromise) {
      return pendingPromise;
    }

    activeSlot.value = slot;
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
      rejectPending(new Error(TURNSTILE_CANCELLED_ERROR));
    }

    clearPending();
  });

  return {
    token,
    isOpen,
    nonce,
    activeSlot,
    cancel,
    ensureToken,
    reset,
  };
};

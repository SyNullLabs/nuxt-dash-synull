import { onBeforeUnmount, ref } from "vue";

export const useVerificationCode = (duration = 60) => {
  const isSending = ref(false);
  const secondsLeft = ref(0);
  let timerId = null;

  const clearTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const startCountdown = () => {
    clearTimer();
    secondsLeft.value = duration;

    timerId = window.setInterval(() => {
      if (secondsLeft.value <= 1) {
        clearTimer();
        secondsLeft.value = 0;
        return;
      }

      secondsLeft.value -= 1;
    }, 1000);
  };

  const reset = () => {
    clearTimer();
    secondsLeft.value = 0;
    isSending.value = false;
  };

  const send = async (handler) => {
    if (isSending.value || secondsLeft.value > 0) {
      return false;
    }

    isSending.value = true;

    try {
      await handler();
      startCountdown();
      return true;
    } finally {
      isSending.value = false;
    }
  };

  onBeforeUnmount(() => {
    clearTimer();
  });

  return {
    isSending,
    secondsLeft,
    reset,
    send,
  };
};

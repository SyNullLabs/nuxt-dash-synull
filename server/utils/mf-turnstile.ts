export const TURNSTILE_REQUIRED_MESSAGE = "请先完成人机验证";
export const TURNSTILE_FAILED_MESSAGE = "Turnstile 验证失败";

type TurnstileValidationResult =
  | { success: true }
  | { success: false; status: number; message: string };

export const validateTurnstileToken = async (
  token: unknown
): Promise<TurnstileValidationResult> => {
  const normalizedToken = token?.toString().trim();

  if (!normalizedToken) {
    return {
      success: false,
      status: 400,
      message: TURNSTILE_REQUIRED_MESSAGE,
    };
  }

  const verification = await verifyTurnstileToken(normalizedToken);

  if (!verification.success) {
    return {
      success: false,
      status: 400,
      message: TURNSTILE_FAILED_MESSAGE,
    };
  }

  return { success: true };
};


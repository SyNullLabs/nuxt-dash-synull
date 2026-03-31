import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";
import { validateTurnstileToken } from "../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const body = await readBody(event);
  const turnstileValidation = await validateTurnstileToken(body?.turnstileToken);

  if (!turnstileValidation.success) {
    return turnstileValidation;
  }

  const { turnstileToken, ...requestBody } = body || {};

  const response = (await requestBackend("/modify_password", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body: requestBody,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "修改密码失败" };
  }

  return { success: true, message: "密码已修改" };
});

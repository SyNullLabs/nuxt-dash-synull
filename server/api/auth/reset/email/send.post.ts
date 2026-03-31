import { buildBackendActionResponse } from "../../../../utils/mf-auth";
import { requestBackendResult } from "../../../../utils/mf-api";
import { validateTurnstileToken } from "../../../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email?.trim();
  const turnstileToken = body.turnstileToken;

  if (!email) {
    return {
      success: false,
      status: 400,
      message: "请输入邮箱地址",
    };
  }

  const turnstileValidation = await validateTurnstileToken(turnstileToken);

  if (!turnstileValidation.success) {
    return turnstileValidation;
  }

  const { payload } = await requestBackendResult("/reset_email_send", {
    method: "POST",
    body: {
      email,
    },
  });

  return buildBackendActionResponse(payload, "发送邮箱重置验证码失败");
});

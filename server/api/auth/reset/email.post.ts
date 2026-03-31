import { buildBackendActionResponse } from "../../../utils/mf-auth";
import { requestBackendResult } from "../../../utils/mf-api";
import { validateTurnstileToken } from "../../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email?.trim();
  const password = body.password;
  const code = body.code?.trim();
  const turnstileToken = body.turnstileToken;

  if (!email || !password || !code) {
    return {
      success: false,
      status: 400,
      message: "请完整填写邮箱重置信息",
    };
  }

  const turnstileValidation = await validateTurnstileToken(turnstileToken);

  if (!turnstileValidation.success) {
    return turnstileValidation;
  }

  const { payload } = await requestBackendResult("/reset_email", {
    method: "POST",
    body: {
      email,
      password,
      code,
    },
  });

  return buildBackendActionResponse(payload, "邮箱密码重置失败");
});

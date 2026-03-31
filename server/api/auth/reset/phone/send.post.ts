import {
  buildBackendActionResponse,
  resolveSmsMkToken,
} from "../../../../utils/mf-auth";
import { requestBackendResult } from "../../../../utils/mf-api";
import { validateTurnstileToken } from "../../../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const phoneCode = body.phoneCode?.toString().trim();
  const phone = body.phone?.toString().trim();
  const turnstileToken = body.turnstileToken;

  if (!phoneCode || !phone) {
    return {
      success: false,
      status: 400,
      message: "请输入区号和手机号",
    };
  }

  const turnstileValidation = await validateTurnstileToken(turnstileToken);

  if (!turnstileValidation.success) {
    return turnstileValidation;
  }

  const mk = await resolveSmsMkToken();
  const { payload } = await requestBackendResult("/reset_phone_send", {
    method: "POST",
    body: {
      phone_code: phoneCode,
      phone,
      mk,
    },
  });

  return buildBackendActionResponse(payload, "发送短信重置验证码失败");
});

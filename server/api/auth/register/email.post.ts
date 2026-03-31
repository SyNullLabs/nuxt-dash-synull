import {
  buildBackendActionResponse,
  clearCaptchaSession,
  readCaptchaSession,
} from "../../../utils/mf-auth";
import { requestBackendResult } from "../../../utils/mf-api";
import { validateTurnstileToken } from "../../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email?.trim();
  const password = body.password;
  const code = body.code?.trim();
  const captcha = body.captcha?.trim();
  const saleId = body.saleId?.toString().trim();
  const turnstileToken = body.turnstileToken;

  if (!email || !password || !code || !captcha) {
    return {
      success: false,
      status: 400,
      message: "请完整填写邮箱注册信息",
    };
  }

  const turnstileValidation = await validateTurnstileToken(turnstileToken);

  if (!turnstileValidation.success) {
    return turnstileValidation;
  }

  const captchaSession = readCaptchaSession(event);

  if (!captchaSession) {
    return {
      success: false,
      status: 400,
      message: "请先刷新图形验证码",
    };
  }

  const { payload } = await requestBackendResult("/register_email", {
    method: "POST",
    headers: {
      cookie: captchaSession,
    },
    body: {
      email,
      password,
      code,
      captcha,
      ...(saleId ? { sale_id: saleId } : {}),
    },
  });

  if (Number(payload?.status) === 200) {
    clearCaptchaSession(event);
  }

  return buildBackendActionResponse(payload, "邮箱注册失败");
});

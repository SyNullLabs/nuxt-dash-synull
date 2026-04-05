import {
  buildBackendActionResponse,
  clearAffSession,
  clearCaptchaSession,
  fetchAuthMethodConfig,
  readAffSession,
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
  // sale_id is only forwarded when the register page is opened with ?sale_id=
  // and the frontend submits the linked sales employee ID.
  const saleId = body.saleId?.toString().trim();
  const turnstileToken = body.turnstileToken;
  const authMethodConfig = await fetchAuthMethodConfig();
  const requiresCaptcha = authMethodConfig.captcha?.register?.email;

  if (!email || !password || !code || (requiresCaptcha && !captcha)) {
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

  const captchaSession = requiresCaptcha ? readCaptchaSession(event) : "";

  if (requiresCaptcha && !captchaSession) {
    return {
      success: false,
      status: 400,
      message: "请先刷新图形验证码",
    };
  }

  // Forward the affiliate backend session (set via /api/affiliate/capture)
  // so the backend can link the new account to the referrer.
  // Never send the aff code as sale_id — that field is for sales employees only.
  const affSession = readAffSession(event);

  const cookieHeader = [captchaSession, affSession]
    .filter(Boolean)
    .join("; ")
    .trim();

  const { payload } = await requestBackendResult("/register_email", {
    method: "POST",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    body: {
      email,
      password,
      code,
      ...(requiresCaptcha ? { captcha } : {}),
      ...(saleId ? { sale_id: saleId } : {}),
    },
  });

  if (Number(payload?.status) === 200) {
    if (requiresCaptcha) clearCaptchaSession(event);
    clearAffSession(event);
  }

  return buildBackendActionResponse(payload, "邮箱注册失败");
});

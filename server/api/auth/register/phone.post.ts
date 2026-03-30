import {
  buildBackendActionResponse,
  clearCaptchaSession,
  readCaptchaSession,
} from "../../../utils/mf-auth";
import { requestBackendResult } from "../../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const phoneCode = body.phoneCode?.toString().trim();
  const phone = body.phone?.toString().trim();
  const password = body.password;
  const code = body.code?.toString().trim();
  const captcha = body.captcha?.toString().trim();
  const saleId = body.saleId?.toString().trim();

  if (!phoneCode || !phone || !password || !code || !captcha) {
    return {
      success: false,
      status: 400,
      message: "请完整填写手机注册信息",
    };
  }

  const captchaSession = readCaptchaSession(event);

  if (!captchaSession) {
    return {
      success: false,
      status: 400,
      message: "请先刷新图形验证码",
    };
  }

  const { payload } = await requestBackendResult("/register_phone", {
    method: "POST",
    headers: {
      cookie: captchaSession,
    },
    body: {
      phone_code: phoneCode,
      phone,
      password,
      code,
      captcha,
      ...(saleId ? { sale_id: saleId } : {}),
    },
  });

  if (Number(payload?.status) === 200) {
    clearCaptchaSession(event);
  }

  return buildBackendActionResponse(payload, "手机注册失败");
});

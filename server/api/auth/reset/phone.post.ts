import { buildBackendActionResponse } from "../../../utils/mf-auth";
import { requestBackendResult } from "../../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const phoneCode = body.phoneCode?.toString().trim();
  const phone = body.phone?.toString().trim();
  const password = body.password;
  const code = body.code?.toString().trim();

  if (!phoneCode || !phone || !password || !code) {
    return {
      success: false,
      status: 400,
      message: "请完整填写手机重置信息",
    };
  }

  const { payload } = await requestBackendResult("/reset_phone", {
    method: "POST",
    body: {
      phone_code: phoneCode,
      phone,
      password,
      code,
    },
  });

  return buildBackendActionResponse(payload, "手机密码重置失败");
});

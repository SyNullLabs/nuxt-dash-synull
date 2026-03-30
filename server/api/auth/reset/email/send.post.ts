import { buildBackendActionResponse } from "../../../../utils/mf-auth";
import { requestBackendResult } from "../../../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email?.trim();

  if (!email) {
    return {
      success: false,
      status: 400,
      message: "请输入邮箱地址",
    };
  }

  const { payload } = await requestBackendResult("/reset_email_send", {
    method: "POST",
    body: {
      email,
    },
  });

  return buildBackendActionResponse(payload, "发送邮箱重置验证码失败");
});

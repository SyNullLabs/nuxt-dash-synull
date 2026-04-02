import {
  buildBackendActionResponse,
  normalizeSecondVerifyMethod,
} from "../../../../utils/mf-auth";
import { requestBackendResult } from "../../../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email?.trim();
  const password = body.password;
  const action = body.action?.toString().trim() || "login";
  const type = normalizeSecondVerifyMethod(body.type) || "email";

  if (!email || !password) {
    return {
      success: false,
      status: 400,
      message: "请输入邮箱和密码",
    };
  }

  const { payload } = await requestBackendResult("/login/second_verify_send", {
    method: "POST",
    body: {
      type,
      action,
      username: email,
      password,
    },
  });

  return buildBackendActionResponse(
    payload,
    type === "phone" ? "发送短信验证码失败" : "发送邮箱验证码失败"
  );
});

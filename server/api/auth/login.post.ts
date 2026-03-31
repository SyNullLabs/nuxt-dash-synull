import { requestBackend } from "../../utils/mf-api";
import { validateTurnstileToken } from "../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email?.trim();
  const password = body.password;
  const turnstileToken = body.turnstileToken;

  if (!email || !password) {
    return {
      success: false,
      message: "请输入邮箱和密码",
    };
  }

  const turnstileValidation = await validateTurnstileToken(turnstileToken);

  if (!turnstileValidation.success) {
    return turnstileValidation;
  }

  const loginResponse = await requestBackend("/login_pass_email", {
    method: "POST",
    body: {
      email,
      password,
    },
  });

  if (loginResponse.status === 200 && loginResponse.jwt) {
    return {
      success: true,
      jwt: loginResponse.jwt,
      message: loginResponse.msg,
    };
  }

  return {
    success: false,
    message: loginResponse.msg || "登录失败",
  };
});

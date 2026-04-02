import { requestBackendResult } from "../../utils/mf-api";
import { fetchLoginSecondVerifyState } from "../../utils/mf-auth";
import { validateTurnstileToken } from "../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email?.trim();
  const password = body.password;
  const code = body.code?.toString().trim();
  const turnstileToken = body.turnstileToken;

  if (!email || !password) {
    return {
      success: false,
      message: "请输入邮箱和密码",
    };
  }

  if (!code) {
    const turnstileValidation = await validateTurnstileToken(turnstileToken);

    if (!turnstileValidation.success) {
      return turnstileValidation;
    }
  }

  const { payload: loginResponse } = await requestBackendResult(
    "/login_pass_email",
    {
      method: "POST",
      body: {
        email,
        password,
        ...(code ? { code } : {}),
      },
    }
  );

  if (Number(loginResponse?.status) === 200 && loginResponse?.jwt) {
    return {
      success: true,
      jwt: loginResponse.jwt,
      message: loginResponse.msg,
    };
  }

  const secondVerify = await fetchLoginSecondVerifyState(email, password).catch(
    () => null
  );

  if (secondVerify) {
    return {
      success: false,
      message: loginResponse?.msg || "请完成二次验证",
      secondVerify,
    };
  }

  return {
    success: false,
    message: loginResponse?.msg || "登录失败",
  };
});

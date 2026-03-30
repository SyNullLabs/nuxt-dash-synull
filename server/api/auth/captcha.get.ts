import {
  getBackendSetCookieHeaders,
  readCaptchaSession,
  rememberCaptchaSession,
} from "../../utils/mf-auth";
import { requestBackendRaw } from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const name = query.name?.toString().trim();

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少验证码场景标识",
    });
  }

  const captchaSession = readCaptchaSession(event);
  const response = await requestBackendRaw(
    `/verify?${new URLSearchParams({ name }).toString()}`,
    {
      headers: captchaSession
        ? {
            cookie: captchaSession,
          }
        : undefined,
    }
  );

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: "获取图形验证码失败",
    });
  }

  rememberCaptchaSession(event, getBackendSetCookieHeaders(response.headers));
  setHeader(
    event,
    "content-type",
    response.headers.get("content-type") || "image/png"
  );
  setHeader(event, "cache-control", "no-store");

  return new Uint8Array(await response.arrayBuffer());
});

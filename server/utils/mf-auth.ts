import type { H3Event } from "h3";
import { requestBackendResult } from "./mf-api";

const CAPTCHA_SESSION_COOKIE = "mf_captcha_session";
const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

const normalizeStatus = (payload?: Record<string, any>) => {
  const status = Number(payload?.status);
  return Number.isFinite(status) ? status : 500;
};

const serializeBackendCookies = (setCookies: string[]) => {
  return setCookies
    .map((cookie) => cookie.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
};

export const buildBackendActionResponse = (
  payload: Record<string, any> = {},
  fallbackMessage: string
) => {
  const status = normalizeStatus(payload);

  return {
    success: status === 200,
    status,
    message: payload?.msg || fallbackMessage,
    data: payload?.data ?? null,
  };
};

export const getBackendSetCookieHeaders = (headers: Headers) => {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const singleValue = headers.get("set-cookie");

  return singleValue ? [singleValue] : [];
};

export const rememberCaptchaSession = (
  event: H3Event,
  setCookies: string[]
) => {
  const serializedCookies = serializeBackendCookies(setCookies);

  if (!serializedCookies) {
    return;
  }

  setCookie(
    event,
    CAPTCHA_SESSION_COOKIE,
    encodeURIComponent(serializedCookies),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    }
  );
};

export const readCaptchaSession = (event: H3Event) => {
  const sessionCookie = getCookie(event, CAPTCHA_SESSION_COOKIE);
  return sessionCookie ? decodeURIComponent(sessionCookie) : "";
};

export const clearCaptchaSession = (event: H3Event) => {
  deleteCookie(event, CAPTCHA_SESSION_COOKIE, {
    path: "/",
  });
};

const readOptionalBooleanFlag = (data: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = data?.[key];

    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value === 1;
    }

    if (typeof value === "string") {
      return ENABLED_VALUES.has(value.trim().toLowerCase());
    }
  }

  return undefined;
};

const readBooleanFlag = (
  data: Record<string, any>,
  keys: string[],
  fallback = false
) => {
  const result = readOptionalBooleanFlag(data, keys);
  return result === undefined ? fallback : result;
};

export const extractAuthMethodConfig = (data: Record<string, any> = {}) => {
  const allowEmail = readBooleanFlag(data, ["allow_email"]);
  const allowPhone = readBooleanFlag(data, ["allow_phone"]);
  const allowWechat = readBooleanFlag(data, ["allow_wechat"]);

  const login = {
    email: readBooleanFlag(data, ["allow_login_email"], allowEmail),
    phone: readBooleanFlag(data, ["allow_login_phone"], allowPhone),
    wechat: readBooleanFlag(data, ["allow_login_wechat"], allowWechat),
  };

  const register = {
    email: readBooleanFlag(data, ["allow_register_email"], allowEmail),
    phone: readBooleanFlag(data, ["allow_register_phone"], allowPhone),
    wechat: readBooleanFlag(data, ["allow_register_wechat"], allowWechat),
  };

  const resetEmailBase = login.email || register.email;
  const resetPhoneBase = login.phone || register.phone;

  return {
    login,
    register,
    reset: {
      email:
        readBooleanFlag(
          data,
          ["allow_reset_email", "allow_findpass_email", "allow_forget_email"],
          resetEmailBase
        ) && resetEmailBase,
      phone:
        readBooleanFlag(
          data,
          ["allow_reset_phone", "allow_findpass_phone", "allow_forget_phone"],
          resetPhoneBase
        ) && resetPhoneBase,
    },
  };
};

export const resolveSmsMkToken = async () => {
  const { payload } = await requestBackendResult("/common_list", {
    method: "GET",
  });

  const mk = payload?.data?.msfntk;

  if (!mk) {
    throw createError({
      statusCode: 502,
      statusMessage: payload?.msg || "无法获取短信发送令牌",
    });
  }

  return mk;
};

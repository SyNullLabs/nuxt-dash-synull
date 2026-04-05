import type { H3Event } from "h3";
import { requestBackendResult } from "./mf-api";

const CAPTCHA_SESSION_COOKIE = "mf_captcha_session";
const AFF_SESSION_COOKIE = "mf_aff_session";
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

export type SecondVerifyMethod = "email" | "phone";

const SECOND_VERIFY_EMAIL_KEYS = [
  "email",
  "email_mask",
  "mask_email",
  "email_desc",
  "email_text",
  "to_email",
];
const SECOND_VERIFY_PHONE_KEYS = [
  "phone",
  "phone_mask",
  "mask_phone",
  "phone_desc",
  "phone_text",
  "mobile",
  "tel",
];

const readFirstString = (data: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = data?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

export const normalizeSecondVerifyMethod = (
  value: unknown
): SecondVerifyMethod | null => {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const normalizedValue = value.toString().trim().toLowerCase();

  if (!normalizedValue) {
    return null;
  }

  if (["email", "mail"].includes(normalizedValue)) {
    return "email";
  }

  if (
    ["phone", "sms", "mobile", "tel", "telephone"].includes(normalizedValue)
  ) {
    return "phone";
  }

  return null;
};

const collectSecondVerifyMethods = (
  candidate: unknown,
  methods: Set<SecondVerifyMethod>
) => {
  if (Array.isArray(candidate)) {
    candidate.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        const nestedType = normalizeSecondVerifyMethod(
          (item as Record<string, any>).type ||
            (item as Record<string, any>).value ||
            (item as Record<string, any>).name
        );

        if (nestedType) {
          methods.add(nestedType);
        }

        return;
      }

      const method = normalizeSecondVerifyMethod(item);

      if (method) {
        methods.add(method);
      }
    });

    return;
  }

  if (typeof candidate === "string") {
    candidate
      .split(/[,|/ ]+/)
      .map((item) => normalizeSecondVerifyMethod(item))
      .filter((item): item is SecondVerifyMethod => Boolean(item))
      .forEach((item) => methods.add(item));

    return;
  }

  const method = normalizeSecondVerifyMethod(candidate);

  if (method) {
    methods.add(method);
  }
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

export const rememberAffSession = (
  event: H3Event,
  setCookies: string[],
  maxAge = 60 * 60 * 24 * 30
) => {
  const serializedCookies = serializeBackendCookies(setCookies);

  if (!serializedCookies) {
    return;
  }

  setCookie(event, AFF_SESSION_COOKIE, encodeURIComponent(serializedCookies), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
};

export const readAffSession = (event: H3Event) => {
  const sessionCookie = getCookie(event, AFF_SESSION_COOKIE);
  return sessionCookie ? decodeURIComponent(sessionCookie) : "";
};

export const clearAffSession = (event: H3Event) => {
  deleteCookie(event, AFF_SESSION_COOKIE, { path: "/" });
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
    captcha: {
      register: {
        email: readBooleanFlag(data, ["allow_register_email_captcha"]),
        phone: readBooleanFlag(data, ["allow_register_phone_captcha"]),
      },
      reset: {
        email: readBooleanFlag(data, [
          "allow_reset_email_captcha",
          "allow_findpass_email_captcha",
          "allow_forget_email_captcha",
        ]),
        phone: readBooleanFlag(data, [
          "allow_reset_phone_captcha",
          "allow_findpass_phone_captcha",
          "allow_forget_phone_captcha",
        ]),
      },
    },
    // Raw sales-assignment config returned by login_register_index.
    setsaler: readBooleanFlag(data, ["setsaler"]),
    saler: Array.isArray(data?.saler) ? (data.saler as Array<Record<string, any>>) : [],
    // is_aff: whether the affiliate program is enabled
    isAff: readBooleanFlag(data, ["is_aff"]),
  };
};

export const normalizeSecondVerifyPayload = (data: Record<string, any> = {}) => {
  const methods = new Set<SecondVerifyMethod>();
  const emailRecipient = readFirstString(data, SECOND_VERIFY_EMAIL_KEYS);
  const phoneRecipient = readFirstString(data, SECOND_VERIFY_PHONE_KEYS);

  [
    data?.type,
    data?.types,
    data?.verify_type,
    data?.verify_types,
    data?.verifyType,
    data?.available_type,
    data?.available_types,
    data?.methods,
    data?.method,
    data?.list,
    data?.options,
  ].forEach((candidate) => collectSecondVerifyMethods(candidate, methods));

  if (
    emailRecipient ||
    readBooleanFlag(data, [
      "allow_email",
      "has_email",
      "bind_email",
      "verify_email",
    ])
  ) {
    methods.add("email");
  }

  if (
    phoneRecipient ||
    readBooleanFlag(data, [
      "allow_phone",
      "has_phone",
      "bind_phone",
      "verify_phone",
    ])
  ) {
    methods.add("phone");
  }

  const selectedType =
    normalizeSecondVerifyMethod(
      data?.default_type ||
        data?.defaultType ||
        data?.selected_type ||
        data?.selectedType ||
        data?.type
    ) ||
    Array.from(methods)[0] ||
    "email";

  if (!methods.size) {
    methods.add(selectedType);
  }

  return {
    required: true,
    action:
      readFirstString(data, ["action", "scene", "send_action", "sendAction"]) ||
      "login",
    methods: Array.from(methods),
    selectedType,
    recipients: {
      email: emailRecipient,
      phone: phoneRecipient,
    },
  };
};

export const fetchAuthMethodConfig = async () => {
  const { payload } = await requestBackendResult("/login_register_index", {
    method: "GET",
  });

  if (Number(payload?.status) !== 200) {
    throw createError({
      statusCode: 502,
      statusMessage: payload?.msg || "获取认证方式失败",
    });
  }

  return extractAuthMethodConfig(payload?.data || {});
};

export const fetchLoginSecondVerifyState = async (
  username: string,
  password: string
) => {
  const { payload } = await requestBackendResult("/login/second_verify_page", {
    method: "GET",
    query: {
      username,
      password,
    },
  });

  if (Number(payload?.status) !== 200) {
    return null;
  }

  return normalizeSecondVerifyPayload(payload?.data || {});
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

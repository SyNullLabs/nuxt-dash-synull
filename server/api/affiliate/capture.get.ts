import {
  AFFILIATE_COOKIE_MAX_AGE,
  AFFILIATE_COOKIE_NAME,
  normalizeAffiliateValue,
  resolveAffiliateCaptureOrigin,
} from "../../utils/affiliate";
import {
  getBackendSetCookieHeaders,
  rememberAffSession,
} from "../../utils/mf-auth";
import { requestBackendResult } from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const originHeader = getHeader(event, "origin");
  const requestHost =
    getHeader(event, "x-forwarded-host") || getHeader(event, "host") || "";
  const allowedOrigin = (() => {
    if (!originHeader) {
      return "";
    }

    try {
      const parsedOrigin = new URL(originHeader);

      if (parsedOrigin.host === requestHost) {
        return parsedOrigin.origin;
      }
    } catch {
      return "";
    }

    return resolveAffiliateCaptureOrigin(originHeader);
  })();

  if (originHeader && !allowedOrigin) {
    setResponseStatus(event, 403);
    return {
      success: false,
      message: "来源未被允许",
    };
  }

  if (allowedOrigin) {
    setHeader(event, "access-control-allow-origin", allowedOrigin);
    setHeader(event, "access-control-allow-credentials", "true");
    setHeader(event, "access-control-allow-methods", "GET, OPTIONS");
    setHeader(event, "access-control-allow-headers", "Content-Type");
    setHeader(event, "vary", "Origin");
  }

  const query = getQuery(event);
  const affiliateValue = normalizeAffiliateValue(query.aff);

  if (!affiliateValue) {
    return {
      success: false,
      message: "缺少 aff 参数",
    };
  }

  // Attribution window: backend doesn't expose this via API, so we read it
  // from runtime config (AFFILIATE_DAYS env var), defaulting to 30 days.
  const config = useRuntimeConfig(event);
  const configDays = Number(config.affiliateDays);
  const affMaxAge = configDays > 0 ? configDays * 24 * 60 * 60 : AFFILIATE_COOKIE_MAX_AGE;

  // Call /aff to register the visit — this is an entry-point only, it doesn't
  // return config. Its purpose is to let the backend link the session to the
  // referrer before the user registers.
  try {
    const { response } = await requestBackendResult("/aff", {
      method: "GET",
      query: { aff: affiliateValue },
    });

    const setCookies = getBackendSetCookieHeaders(response.headers as Headers);
    rememberAffSession(event, setCookies, affMaxAge);
  } catch {
    // Non-fatal: fall back — browser cookie is still saved below.
  }

  setCookie(event, AFFILIATE_COOKIE_NAME, affiliateValue, {
    path: "/",
    sameSite: "lax",
    maxAge: affMaxAge,
  });

  return {
    success: true,
  };
});

import {
  AFFILIATE_COOKIE_MAX_AGE,
  AFFILIATE_COOKIE_NAME,
  normalizeAffiliateValue,
  resolveAffiliateCaptureOrigin,
} from "../../utils/affiliate";

export default defineEventHandler((event) => {
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

  setCookie(event, AFFILIATE_COOKIE_NAME, affiliateValue, {
    path: "/",
    sameSite: "lax",
    maxAge: AFFILIATE_COOKIE_MAX_AGE,
  });

  return {
    success: true,
  };
});

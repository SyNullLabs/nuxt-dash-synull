import { resolveAffiliateCaptureOrigin } from "../../utils/affiliate";

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

  if (!allowedOrigin) {
    setResponseStatus(event, originHeader ? 403 : 204);
    return;
  }

  setHeader(event, "access-control-allow-origin", allowedOrigin);
  setHeader(event, "access-control-allow-credentials", "true");
  setHeader(event, "access-control-allow-methods", "GET, OPTIONS");
  setHeader(event, "access-control-allow-headers", "Content-Type");
  setHeader(event, "vary", "Origin");
  setResponseStatus(event, 204);
});

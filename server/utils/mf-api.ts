import type { H3Event } from "h3";
import type { FetchOptions } from "ofetch";
import { joinURL } from "ufo";

export const requestBackend = (path: string, options: FetchOptions = {}) => {
  const config = useRuntimeConfig();

  if (!config.backUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "BACK_URL 未配置",
    });
  }

  return $fetch(joinURL(config.backUrl, path), options);
};

export const requireBackendAuthorization = (event: H3Event) => {
  const token = getHeader(event, "authorization");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "未提供授权令牌",
    });
  }

  return token.startsWith("JWT ") ? token : `JWT ${token}`;
};

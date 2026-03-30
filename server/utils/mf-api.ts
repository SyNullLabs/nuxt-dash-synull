import type { H3Event } from "h3";
import type { FetchOptions } from "ofetch";
import { joinURL } from "ufo";

const resolveBackendBaseUrl = () => {
  const config = useRuntimeConfig();

  if (!config.backUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "BACK_URL/BACKEND_URL 未配置",
    });
  }

  return config.backUrl;
};

export const requestBackend = (path: string, options: FetchOptions = {}) => {
  return $fetch(joinURL(resolveBackendBaseUrl(), path), options);
};

export const requestBackendResult = async (
  path: string,
  options: FetchOptions = {}
) => {
  const response = await $fetch.raw<Record<string, any>>(
    joinURL(resolveBackendBaseUrl(), path),
    {
      ...options,
      ignoreResponseError: true,
    }
  );

  return {
    payload: response._data || {},
    response,
  };
};

export const requestBackendRaw = (path: string, init: RequestInit = {}) => {
  return fetch(joinURL(resolveBackendBaseUrl(), path), init);
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

import type { H3Event } from "h3";
import type { FetchOptions } from "ofetch";
import { joinURL } from "ufo";

export type BackendScope =
  | "auth"
  | "cart"
  | "dashboard"
  | "products"
  | "tickets"
  | "upload"
  | "user";

const BACKEND_SCOPE_ALIASES: Record<string, BackendScope> = {
  auth: "auth",
  cart: "cart",
  dash: "dashboard",
  dashboard: "dashboard",
  product: "products",
  products: "products",
  ticket: "tickets",
  tickets: "tickets",
  upload: "upload",
  uploads: "upload",
  user: "user",
  users: "user",
};

const resolveBackendBaseUrl = () => {
  const config = useRuntimeConfig();

  if (!config.backUrl) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "MIDDLEWARE_BACKEND_URL/BACK_URL/BACKEND_URL/NUXT_BACK_URL 未配置",
    });
  }

  return config.backUrl;
};

const resolveDirectBackendBaseUrl = () => {
  const config = useRuntimeConfig();
  const directBackUrl =
    typeof config.directBackUrl === "string" ? config.directBackUrl.trim() : "";

  if (directBackUrl) {
    return directBackUrl;
  }

  return resolveBackendBaseUrl();
};

const resolveGlobalMiddlewareBaseUrl = () => {
  const config = useRuntimeConfig();

  return typeof config.globalMiddlewareUrl === "string"
    ? config.globalMiddlewareUrl.trim()
    : "";
};

const parseConfiguredHeaders = (rawHeaderConfig: unknown, envName: string) => {
  const rawHeaders =
    typeof rawHeaderConfig === "string" ? rawHeaderConfig.trim() : "";

  if (!rawHeaders) {
    return {};
  }

  let parsedHeaders: unknown;

  try {
    parsedHeaders = JSON.parse(rawHeaders);
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: `${envName} 必须是合法的 JSON 数组`,
    });
  }

  if (!Array.isArray(parsedHeaders)) {
    throw createError({
      statusCode: 500,
      statusMessage: `${envName} 必须是 JSON 数组`,
    });
  }

  return parsedHeaders.reduce<Record<string, string>>((headers, item) => {
    let headerName = "";
    let headerValue = "";

    if (Array.isArray(item)) {
      headerName = item[0]?.toString().trim() || "";
      headerValue = item[1]?.toString().trim() || "";
    } else if (typeof item === "object" && item !== null) {
      headerName =
        (item as Record<string, any>).name?.toString().trim() ||
        (item as Record<string, any>).key?.toString().trim() ||
        "";
      headerValue = (item as Record<string, any>).value?.toString().trim() || "";
    } else if (typeof item === "string") {
      const separatorIndex = item.indexOf(":");

      if (separatorIndex > 0) {
        headerName = item.slice(0, separatorIndex).trim();
        headerValue = item.slice(separatorIndex + 1).trim();
      }
    }

    if (!headerName || !headerValue) {
      throw createError({
        statusCode: 500,
        statusMessage: `${envName} 数组项必须是 [name, value]、{name,value} 或 'name:value'`,
      });
    }

    headers[headerName] = headerValue;
    return headers;
  }, {});
};

const resolveBackendRequestHeaders = () => {
  const config = useRuntimeConfig();

  return parseConfiguredHeaders(
    config.backHeaders,
    "MIDDLEWARE_BACKEND_HEADERS"
  );
};

const resolveMiddlewareServiceRequestHeaders = () => {
  const config = useRuntimeConfig();

  return parseConfiguredHeaders(
    config.middlewareServiceHeaders,
    "MIDDLEWARE_SERVICE_HEADERS"
  );
};

const resolveScopedMiddlewareBaseUrl = (scope: BackendScope) => {
  const config = useRuntimeConfig();
  const middlewareServiceUrl =
    typeof config.middlewareServiceUrl === "string"
      ? config.middlewareServiceUrl.trim()
      : "";
  const rawScopes =
    typeof config.middlewareServiceScopes === "string"
      ? config.middlewareServiceScopes.trim()
      : "";

  if (!middlewareServiceUrl || !rawScopes) {
    return "";
  }

  const resolvedScopes = rawScopes
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const normalizedScope = BACKEND_SCOPE_ALIASES[item.toLowerCase()];

      if (!normalizedScope) {
        throw createError({
          statusCode: 500,
          statusMessage: `MIDDLEWARE_SERVICE_SCOPES 包含未知 scope: ${item}`,
        });
      }

      return normalizedScope;
    });

  return resolvedScopes.includes(scope) ? middlewareServiceUrl : "";
};

const mergeConfiguredHeaders = (
  headers?: HeadersInit,
  configuredHeaders: Record<string, string> = {}
) => {
  const mergedHeaders = new Headers(headers || {});

  Object.entries(configuredHeaders).forEach(([key, value]) => {
    mergedHeaders.set(key, value);
  });

  return mergedHeaders;
};

const mergeBackendHeaders = (headers?: HeadersInit) =>
  mergeConfiguredHeaders(headers, resolveBackendRequestHeaders());

const mergeMiddlewareServiceHeaders = (headers?: HeadersInit) =>
  mergeConfiguredHeaders(headers, resolveMiddlewareServiceRequestHeaders());

const resolveScopedUpstream = (scope: BackendScope) => {
  const globalMiddlewareBaseUrl = resolveGlobalMiddlewareBaseUrl();

  if (globalMiddlewareBaseUrl) {
    return {
      baseUrl: globalMiddlewareBaseUrl,
      mergeHeaders: mergeBackendHeaders,
    };
  }

  const scopedMiddlewareBaseUrl = resolveScopedMiddlewareBaseUrl(scope);

  if (scopedMiddlewareBaseUrl) {
    return {
      baseUrl: scopedMiddlewareBaseUrl,
      mergeHeaders: mergeMiddlewareServiceHeaders,
    };
  }

  return {
    baseUrl: resolveDirectBackendBaseUrl(),
    mergeHeaders: mergeBackendHeaders,
  };
};

export const requestBackend = (path: string, options: FetchOptions = {}) => {
  return $fetch(joinURL(resolveBackendBaseUrl(), path), {
    ...options,
    headers: mergeBackendHeaders(options.headers as HeadersInit),
  });
};

// Allows migrating selected modules to an external middleware service
// without cutting all backend traffic away from Nuxt at once.
export const requestBackendForScope = (
  scope: BackendScope,
  path: string,
  options: FetchOptions = {}
) => {
  const upstream = resolveScopedUpstream(scope);

  return $fetch(joinURL(upstream.baseUrl, path), {
    ...options,
    headers: upstream.mergeHeaders(options.headers as HeadersInit),
  });
};

export const requestBackendResult = async (
  path: string,
  options: FetchOptions = {}
) => {
  const response = await $fetch.raw<Record<string, any>>(
    joinURL(resolveBackendBaseUrl(), path),
    {
      ...options,
      headers: mergeBackendHeaders(options.headers as HeadersInit),
      ignoreResponseError: true,
    }
  );

  return {
    payload: response._data || {},
    response,
  };
};

export const requestBackendRaw = (path: string, init: RequestInit = {}) => {
  return fetch(joinURL(resolveBackendBaseUrl(), path), {
    ...init,
    headers: mergeBackendHeaders(init.headers),
  });
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

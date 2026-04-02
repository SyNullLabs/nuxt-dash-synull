import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

const readBooleanFlag = (value: unknown, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    return normalizedValue === "1" || normalizedValue === "true" || normalizedValue === "yes";
  }

  return fallback;
};

const normalizeApiSummary = (data: Record<string, any> = {}) => {
  const client = Array.isArray(data.client) ? data.client[0] || {} : data.client || {};
  const apiKey =
    data.api_key ||
    data.secret ||
    client.api_key ||
    client.api_password ||
    client.secret ||
    "";
  const explicitOpenState =
    client.api_open ?? data.api_open ?? client.is_open ?? data.is_open;

  return {
    ...data,
    ...client,
    api_key: apiKey,
    is_open:
      explicitOpenState === undefined
        ? Boolean(apiKey)
        : readBooleanFlag(explicitOpenState),
  };
};

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const method = getMethod(event);

  if (method === "GET") {
    const query = getQuery(event);
    const action = (query.action as string) || "summary";
    const pathMap: Record<string, string> = {
      summary: "/zjmf_finance_api/summary",
      logs: "/zjmf_finance_api/logs",
    };
    const path = pathMap[action] || pathMap.summary;

    const response = (await requestBackend(path, {
      method: "GET",
      headers: { "Content-Type": "application/json", authorization },
      query: { ...query, action: undefined },
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "获取API信息失败" };
    }

    if (action === "summary") {
      return { success: true, data: normalizeApiSummary(response.data) };
    }

    return {
      success: true,
      data: Array.isArray(response.data)
        ? response.data
        : response.data?.logs || response.data?.list || [],
    };
  }

  if (method === "POST") {
    const body = await readBody(event);
    const action = body?.action || "open";
    const pathMap: Record<string, string> = {
      open: "/zjmf_finance_api/open",
      close: "/zjmf_finance_api/open",
      reset: "/zjmf_finance_api/reset",
    };
    const path = pathMap[action] || pathMap.open;
    const { action: _action, ...requestBody } = body || {};
    const payload =
      action === "reset"
        ? requestBody
        : {
            ...requestBody,
            api_open:
              requestBody?.api_open !== undefined
                ? requestBody.api_open
                : action === "close"
                  ? 0
                  : 1,
          };

    const response = (await requestBackend(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body: payload,
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "操作失败" };
    }

    return {
      success: true,
      data:
        action === "reset"
          ? response.data
          : {
              ...(response.data || {}),
              is_open: readBooleanFlag(payload.api_open),
            },
      message: response.msg,
    };
  }

  return { success: false, message: "不支持的方法" };
});

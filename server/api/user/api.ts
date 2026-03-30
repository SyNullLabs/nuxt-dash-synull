import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

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
    return { success: true, data: response.data };
  }

  if (method === "POST") {
    const body = await readBody(event);
    const action = body?.action || "open";
    const pathMap: Record<string, string> = {
      open: "/zjmf_finance_api/open",
      reset: "/zjmf_finance_api/reset",
    };
    const path = pathMap[action] || pathMap.open;

    const response = (await requestBackend(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body,
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "操作失败" };
    }
    return { success: true, data: response.data, message: response.msg };
  }

  return { success: false, message: "不支持的方法" };
});

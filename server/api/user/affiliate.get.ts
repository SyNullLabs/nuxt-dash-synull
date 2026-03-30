import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const query = getQuery(event);
  const action = (query.action as string) || "page";

  const pathMap: Record<string, string> = {
    page: "/affpage",
    index: "/affindex",
    activate: "/activation",
  };

  if (action === "records") {
    const body = await readBody(event).catch(() => ({}));
    const response = (await requestBackend("/affbuyrecord", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body,
    })) as Record<string, any>;
    return { success: response.status === 200, data: response.data, message: response.msg };
  }

  const response = (await requestBackend(pathMap[action] || pathMap.page, {
    method: "GET",
    headers: { "Content-Type": "application/json", authorization },
    query: { ...query, action: undefined },
  })) as Record<string, any>;

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取推荐信息失败" };
  }

  return { success: true, data: response.data };
});

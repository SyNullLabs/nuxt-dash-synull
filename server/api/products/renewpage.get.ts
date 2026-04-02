import {
  requestBackendForScope,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const query = getQuery(event);

  const response = (await requestBackendForScope(
    "products",
    "/host/renewpage",
    {
      method: "GET",
      headers: { "Content-Type": "application/json", authorization },
      query,
    }
  )) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取续费信息失败" };
  }

  return { success: true, data: response.data };
});

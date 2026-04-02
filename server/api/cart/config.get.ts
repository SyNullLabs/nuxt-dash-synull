import {
  requestBackendForScope,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  // Auth is optional — allow unauthenticated product browsing
  const authorization = getHeader(event, "authorization") || "";
  const query = getQuery(event);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authorization) headers.authorization = authorization;

  const response = (await requestBackendForScope(
    "cart",
    "/cart/get_product_config",
    {
      method: "GET",
      headers,
      query,
    }
  )) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取产品配置失败" };
  }

  return { success: true, data: response.data };
});

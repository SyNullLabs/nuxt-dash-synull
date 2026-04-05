import { requestBackendForScope } from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, "authorization") || "";
  const query = getQuery(event);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authorization) {
    headers.authorization = authorization;
  }

  const response = (await requestBackendForScope("cart", "/cart/index", {
    method: "GET",
    headers,
    query,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取产品首页失败" };
  }

  return {
    success: true,
    data:
      typeof response.data === "object" && response.data !== null
        ? response.data
        : response,
  };
});

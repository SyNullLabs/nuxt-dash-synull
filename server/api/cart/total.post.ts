import {
  requestBackendForScope,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, "authorization") || "";
  const body = await readBody(event);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authorization) headers.authorization = authorization;

  const response = (await requestBackendForScope("cart", "/cart/get_total", {
    method: "POST",
    headers,
    body,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "计算价格失败" };
  }

  return { success: true, data: response.data };
});

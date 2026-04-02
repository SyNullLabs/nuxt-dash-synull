import {
  requestBackendForScope,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);

  const response = (await requestBackendForScope("cart", "/cart/clear", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "清空购物车失败" };
  }

  return { success: true, message: "购物车已清空" };
});

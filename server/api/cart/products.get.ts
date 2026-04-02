import { requestBackendForScope } from "../../utils/mf-api";

export default defineEventHandler(async () => {
  const response = (await requestBackendForScope("cart", "/cart/all", {
    method: "GET",
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取产品列表失败" };
  }

  return { success: true, data: response.data };
});

import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const body = await readBody(event);

  const response = (await requestBackend("/cart/add_to_shop", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200 && response.status !== 201) {
    return { success: false, message: response.msg || "添加到购物车失败" };
  }

  return { success: true, data: response.data, message: "已添加到购物车" };
});

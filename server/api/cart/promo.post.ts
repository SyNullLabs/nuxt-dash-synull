import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const body = await readBody(event);
  const action = body?.action || "add";

  const path =
    action === "remove" ? "/cart/remove_promo" : "/cart/add_promo";

  const response = (await requestBackend(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "优惠码操作失败" };
  }

  return { success: true, data: response.data };
});

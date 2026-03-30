import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);

  const response = (await requestBackend("/cartgateway", {
    method: "GET",
    headers: { "Content-Type": "application/json", authorization },
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取支付方式失败" };
  }

  return { success: true, data: response.data };
});

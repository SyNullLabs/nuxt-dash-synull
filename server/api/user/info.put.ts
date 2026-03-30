import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const body = await readBody(event);

  const response = (await requestBackend("/user_info", {
    method: "PUT",
    headers: { "Content-Type": "application/json", authorization },
    body,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "更新用户信息失败" };
  }

  return { success: true, data: response.data, message: "信息已更新" };
});

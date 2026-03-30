import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const body = await readBody(event);

  const response = (await requestBackend("/ticket/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "回复失败" };
  }

  return { success: true, data: response.data, message: "回复成功" };
});

import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const method = getMethod(event);

  if (method === "GET") {
    const query = getQuery(event);
    const response = (await requestBackend("/host/cancel", {
      method: "GET",
      headers: { "Content-Type": "application/json", authorization },
      query,
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "获取取消信息失败" };
    }
    return { success: true, data: response.data };
  }

  if (method === "POST") {
    const body = await readBody(event);
    const response = (await requestBackend("/host/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body,
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "提交取消请求失败" };
    }
    return { success: true, data: response.data, message: "取消请求已提交" };
  }

  if (method === "DELETE") {
    const query = getQuery(event);
    const response = (await requestBackend("/host/cancel", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", authorization },
      query,
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "撤销取消请求失败" };
    }
    return { success: true, message: "已撤销取消请求" };
  }

  return { success: false, message: "不支持的请求方法" };
});

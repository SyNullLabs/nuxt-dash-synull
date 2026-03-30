import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const method = getMethod(event);

  if (method === "GET") {
    const response = (await requestBackend("/contacts/index", {
      method: "GET",
      headers: { "Content-Type": "application/json", authorization },
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "获取子账户列表失败" };
    }
    return { success: true, data: response.data };
  }

  if (method === "POST") {
    const body = await readBody(event);
    const response = (await requestBackend("/contacts/save", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body,
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "保存子账户失败" };
    }
    return { success: true, data: response.data, message: "保存成功" };
  }

  if (method === "DELETE") {
    const query = getQuery(event);
    const response = (await requestBackend("/contacts/del", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", authorization },
      query,
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "删除子账户失败" };
    }
    return { success: true, message: "已删除" };
  }

  return { success: false, message: "不支持的方法" };
});

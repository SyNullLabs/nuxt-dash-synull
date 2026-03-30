import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const query = getQuery(event);

  const response = (await requestBackend("/credit_limit", {
    method: "GET",
    headers: { "Content-Type": "application/json", authorization },
    query,
  })) as Record<string, any>;

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取信用额信息失败" };
  }

  return { success: true, data: response.data };
});

import { requestBackend, requireBackendAuthorization } from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);

  const response = (await requestBackend("/logOut", {
    method: "GET",
    headers: { "Content-Type": "application/json", authorization },
  })) as Record<string, any>;

  return { success: true, message: "已登出" };
});

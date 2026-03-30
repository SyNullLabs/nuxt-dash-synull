import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";
import { mergeDashboardPayload } from "../../utils/mf-transformers";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);

  const [dashboardResponse, userInfoResponse] = await Promise.all([
    requestBackend("/index", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization,
      },
    }),
    requestBackend("/user_info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization,
      },
    }),
  ]);

  if (dashboardResponse.status !== 200 || userInfoResponse.status !== 200) {
    return {
      success: false,
      message:
        dashboardResponse.msg || userInfoResponse.msg || "获取用户信息失败",
    };
  }

  return {
    success: true,
    data: mergeDashboardPayload(dashboardResponse, userInfoResponse),
    message: "成功获取用户信息",
  };
});

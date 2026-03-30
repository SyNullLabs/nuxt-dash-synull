import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const { groupid } = getQuery(event);

  const response = await requestBackend("/host/list", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization,
    },
    query: groupid ? { groupid } : undefined,
  });

  if (typeof response !== "object" || response === null) {
    return {
      success: false,
      message: "无效的响应数据",
    };
  }

  if (response.status !== 200) {
    return {
      success: false,
      message: response.msg || "获取产品列表失败",
    };
  }

  return {
    success: true,
    data: response,
    message: "成功获取产品列表",
  };
});

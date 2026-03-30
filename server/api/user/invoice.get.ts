import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const query = getQuery(event);
  const action = (query.action as string) || "list";

  const pathMap: Record<string, string> = {
    list: "/voucher/voucherlist",
    info_list: "/voucher/voucherinfolist",
    request: "/voucher/voucherrequest",
  };

  const response = (await requestBackend(pathMap[action] || pathMap.list, {
    method: "GET",
    headers: { "Content-Type": "application/json", authorization },
    query: { ...query, action: undefined },
  })) as Record<string, any>;

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取发票信息失败" };
  }

  return { success: true, data: response.data };
});

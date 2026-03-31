import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

const normalizeAffiliateData = (data: Record<string, any> = {}) => {
  const firstItem = Array.isArray(data?.data) ? data.data[0] || {} : {};

  return {
    ...data,
    ...firstItem,
    referral_link:
      data.referral_link ||
      firstItem.referral_link ||
      firstItem.url ||
      data.url ||
      "",
    total_referrals:
      data.total_referrals ?? firstItem.registcount ?? data.registcount ?? 0,
    total_earnings: data.total_earnings ?? firstItem.sum ?? data.sum ?? "0.00",
    available_balance:
      data.available_balance ?? firstItem.balance ?? data.balance ?? "0.00",
  };
};

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const query = getQuery(event);
  const action = (query.action as string) || "page";

  const pathMap: Record<string, string> = {
    page: "/affpage",
    index: "/affindex",
    activate: "/activation",
  };

  if (action === "records") {
    const body = await readBody(event).catch(() => ({}));
    const response = (await requestBackend("/affbuyrecord", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body,
    })) as Record<string, any>;
    return { success: response.status === 200, data: response.data, message: response.msg };
  }

  const response = (await requestBackend(pathMap[action] || pathMap.page, {
    method: "GET",
    headers: { "Content-Type": "application/json", authorization },
    query: { ...query, action: undefined },
  })) as Record<string, any>;

  if (response.status !== 200) {
    return { success: false, message: response.msg || "获取推荐信息失败" };
  }

  return { success: true, data: normalizeAffiliateData(response.data) };
});

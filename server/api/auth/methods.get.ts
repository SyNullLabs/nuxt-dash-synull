import { requestBackendResult } from "../../utils/mf-api";
import { extractAuthMethodConfig } from "../../utils/mf-auth";

export default defineEventHandler(async () => {
  const { payload } = await requestBackendResult("/login_register_index", {
    method: "GET",
  });

  if (Number(payload?.status) !== 200) {
    throw createError({
      statusCode: 502,
      statusMessage: payload?.msg || "获取认证方式失败",
    });
  }

  return {
    success: true,
    methods: extractAuthMethodConfig(payload?.data || {}),
  };
});

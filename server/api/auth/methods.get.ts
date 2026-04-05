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

  const config = extractAuthMethodConfig(payload?.data || {});

  return {
    success: true,
    methods: config,
    // Raw sales/affiliate config from login_register_index.
    // The register page decides whether to expose sale_id based on the URL query.
    setsaler: config.setsaler,
    saler: config.saler,
    isAff: config.isAff,
  };
});

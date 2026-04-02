import {
  requestBackend,
  requestBackendRaw,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const method = getMethod(event);

  if (method === "GET") {
    const response = (await requestBackend("/certifi", {
      method: "GET",
      headers: { "Content-Type": "application/json", authorization },
    })) as Record<string, any>;

    if (response.status !== 200) {
      return { success: false, message: response.msg || "获取认证信息失败" };
    }
    return { success: true, data: response.data };
  }

  if (method === "POST") {
    const contentType = getHeader(event, "content-type") || "";
    let response: Record<string, any> = {};

    if (contentType.includes("multipart/form-data")) {
      const rawBody = await readRawBody(event, false);
      const rawResponse = await requestBackendRaw("/company_certifi_post", {
        method: "POST",
        headers: {
          authorization,
          ...(contentType ? { "Content-Type": contentType } : {}),
        },
        body: rawBody,
      });

      response = (await rawResponse.json().catch(() => ({}))) as Record<
        string,
        any
      >;
    } else {
      const body = await readBody(event);
      response = (await requestBackend("/company_certifi_post", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization },
        body,
      })) as Record<string, any>;
    }

    if (response.status !== 200) {
      return { success: false, message: response.msg || "提交认证失败" };
    }
    return { success: true, data: response.data, message: "认证资料已提交" };
  }

  return { success: false, message: "不支持的方法" };
});

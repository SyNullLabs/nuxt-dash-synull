import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";
import { validateTurnstileToken } from "../../utils/mf-turnstile";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const body = await readBody(event);
  const action = body?.action;
  const turnstileValidation = await validateTurnstileToken(body?.turnstileToken);

  const endpointMap: Record<string, { path: string; method: string }> = {
    bind_phone_send: { path: "/bind_phone", method: "POST" },
    bind_phone: { path: "/bind_phone_handle", method: "POST" },
    change_phone_send: { path: "/bind_phone_code", method: "GET" },
    change_phone: { path: "/bind_phone_change", method: "POST" },
    bind_email_send: { path: "/bind_email", method: "POST" },
    bind_email: { path: "/bind_email_handle", method: "POST" },
    change_email_send: { path: "/change_email", method: "POST" },
    change_email: { path: "/change_email_handle", method: "POST" },
    toggle_2fa: { path: "/toggle_second_verify", method: "POST" },
    send_2fa: { path: "/second_verify_send", method: "POST" },
    get_2fa_page: { path: "/second_verify_page", method: "GET" },
    login_sms_reminder: { path: "/login_sms_reminder", method: "POST" },
    login_email_reminder: { path: "/login_email_reminder", method: "POST" },
  };

  const endpoint = endpointMap[action];
  if (!endpoint) {
    return { success: false, message: "无效的操作" };
  }

  if (!turnstileValidation.success) {
    return turnstileValidation;
  }

  const { turnstileToken, action: _action, ...requestBody } = body || {};

  const requestOptions: Record<string, any> = {
    method: endpoint.method,
    headers: { "Content-Type": "application/json", authorization },
  };

  if (endpoint.method === "POST") {
    requestOptions.body = requestBody;
  } else if (Object.keys(requestBody).length > 0) {
    requestOptions.query = requestBody;
  }

  const response = (await requestBackend(
    endpoint.path,
    requestOptions
  )) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "操作失败" };
  }

  return { success: true, data: response.data, message: response.msg };
});

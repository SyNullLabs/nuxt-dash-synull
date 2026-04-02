import {
  requestBackend,
  requireBackendAuthorization,
} from "../../utils/mf-api";

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const body = await readBody(event);
  const normalizedBody = {
    ...body,
    tid: body.tid || body.id,
    content: body.content || "",
    attachment: body.attachment || "",
  };

  const response = (await requestBackend("/ticket/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body: normalizedBody,
  })) as Record<string, any>;

  if (typeof response !== "object" || response === null) {
    return { success: false, message: "无效的响应数据" };
  }

  if (response.status !== 200) {
    return { success: false, message: response.msg || "回复失败" };
  }

  return { success: true, data: response.data, message: "回复成功" };
});

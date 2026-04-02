import {
  requestBackendRaw,
  requireBackendAuthorization,
} from "../../utils/mf-api";

const pickUploadedFileUrl = (data: unknown) => {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (Array.isArray(data)) {
    return pickUploadedFileUrl(data[0]);
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, any>;

    return (
      pickUploadedFileUrl(record.url) ||
      pickUploadedFileUrl(record.path) ||
      pickUploadedFileUrl(record.image) ||
      pickUploadedFileUrl(record.file) ||
      Object.values(record)
        .map((value) => pickUploadedFileUrl(value))
        .find(Boolean) ||
      ""
    );
  }

  return "";
};

export default defineEventHandler(async (event) => {
  const authorization = requireBackendAuthorization(event);
  const contentType = getHeader(event, "content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return {
      success: false,
      message: "请上传附件",
    };
  }

  const rawBody = await readRawBody(event, false);
  const response = await requestBackendRaw("/admin/upload_image", {
    method: "POST",
    headers: {
      authorization,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body: rawBody,
  });
  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    any
  >;

  if (Number(payload?.status) !== 200) {
    return {
      success: false,
      message: payload?.msg || "上传附件失败",
    };
  }

  return {
    success: true,
    data: payload?.data ?? null,
    url: pickUploadedFileUrl(payload?.data),
    message: payload?.msg || "上传成功",
  };
});

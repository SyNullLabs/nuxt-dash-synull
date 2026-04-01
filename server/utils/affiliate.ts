export const AFFILIATE_COOKIE_NAME = "synull-affiliate-ref";
export const AFFILIATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const AFFILIATE_CAPTURE_ORIGIN_HOSTS = new Set(["synull.com", "www.synull.com"]);

export const normalizeAffiliateValue = (value: unknown) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.toString().trim();

  return normalizedValue || "";
};

export const resolveAffiliateCaptureOrigin = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  try {
    const parsedUrl = new URL(value);

    if (!AFFILIATE_CAPTURE_ORIGIN_HOSTS.has(parsedUrl.hostname)) {
      return "";
    }

    return parsedUrl.origin;
  } catch {
    return "";
  }
};

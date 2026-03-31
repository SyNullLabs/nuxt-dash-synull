import { useCookie } from "#app";

const AFFILIATE_COOKIE_NAME = "synull-affiliate-ref";
const AFFILIATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const normalizeAffiliateValue = (value) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.toString().trim();

  return normalizedValue || "";
};

export const useAffiliateReferral = () => {
  const affiliateRef = useCookie(AFFILIATE_COOKIE_NAME, {
    path: "/",
    sameSite: "lax",
    maxAge: AFFILIATE_COOKIE_MAX_AGE,
  });

  const readAffiliateQuery = (query = {}) =>
    normalizeAffiliateValue(query.aff);

  const setAffiliateRef = (value) => {
    const normalizedValue = normalizeAffiliateValue(value);
    affiliateRef.value = normalizedValue || null;
    return normalizedValue;
  };

  const syncAffiliateFromQuery = (query = {}) => {
    const queryValue = readAffiliateQuery(query);

    if (!queryValue) {
      return normalizeAffiliateValue(affiliateRef.value);
    }

    return setAffiliateRef(queryValue);
  };

  return {
    affiliateRef,
    readAffiliateQuery,
    setAffiliateRef,
    syncAffiliateFromQuery,
  };
};

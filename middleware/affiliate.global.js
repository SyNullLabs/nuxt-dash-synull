import { useAffiliateReferral } from "~/composables/useAffiliateReferral";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  const { readAffiliateQuery, setAffiliateRef } = useAffiliateReferral();
  const affiliateValue = readAffiliateQuery(to.query);

  if (!affiliateValue) {
    return;
  }

  const response = await fetch(
    `/api/affiliate/capture?aff=${encodeURIComponent(affiliateValue)}`,
    {
      credentials: "same-origin",
    }
  );

  if (!response.ok) {
    return;
  }

  setAffiliateRef(affiliateValue);

  const nextQuery = { ...to.query };
  delete nextQuery.aff;

  return navigateTo(
    {
      path: to.path,
      query: nextQuery,
      hash: to.hash,
    },
    {
      replace: true,
      redirectCode: 302,
    }
  );
});

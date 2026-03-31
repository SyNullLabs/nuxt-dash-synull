import { useAffiliateReferral } from "~/composables/useAffiliateReferral";

export default defineNuxtRouteMiddleware((to) => {
  const { syncAffiliateFromQuery } = useAffiliateReferral();
  syncAffiliateFromQuery(to.query);
});


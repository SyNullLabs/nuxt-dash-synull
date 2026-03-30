export default defineNuxtRouteMiddleware((to) => {
  const publicAuthRoutes = new Set([
    "/auth/login",
    "/auth/register",
    "/auth/reset",
  ]);

  if (publicAuthRoutes.has(to.path)) {
    return;
  }

  if (process.client) {
    const token = localStorage.getItem("jwt");
    if (!token) {
      return navigateTo({
        path: "/auth/login",
        query: { redirect_uri: to.fullPath },
      });
    }
  }
});

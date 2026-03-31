export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.replace(/\/+$/, "") || "/";

  // Public routes that don't require login
  if (
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/reset" ||
    path === "/buy" ||
    path.startsWith("/buy/")
  ) {
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

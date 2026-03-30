export default defineNuxtRouteMiddleware((to, from) => {
  // 检查是否在客户端环境
  if (process.client) {
    const token = localStorage.getItem('jwt')
    if (!token) {
      return navigateTo({
        path: '/auth/login',
        query: { redirect_uri: to.fullPath }
      })
    }
  }
})
import { fromNodeMiddleware } from 'h3';

export default fromNodeMiddleware((req, res, next) => {
  if (process.client) {
    const token = localStorage.getItem('jwt'); // 从 localStorage 获取 JWT
    if (token) {
      // 在请求头中添加 Authorization
      const fetchOptions = useFetchOptions();
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    // 修改错误处理逻辑
    addFetchErrorHandler((error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('jwt'); // 清除无效的 token
        return navigateTo('/auth/login', { replace: true }); // 使用 replace 模式
      }
    });
  }

  next();
});

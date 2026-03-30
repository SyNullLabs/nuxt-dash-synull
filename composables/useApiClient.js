export const useApiClient = () => {
  return (path, options = {}) => {
    const token = getAuthToken();
    const headers = {
      ...(options.headers || {}),
    };
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (token && !headers.Authorization) {
      headers.Authorization = token;
    }

    return $fetch(`/api${normalizedPath}`, {
      ...options,
      headers,
    });
  };
};

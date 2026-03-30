const TOKEN_KEY = "jwt";

export const getAuthToken = () => {
  if (!process.client) {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token) => {
  if (!process.client) {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  if (!process.client) {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
};

const TOKEN_KEY = "jwt";
const LOGIN_PATH = "/auth/login";

const getPathFromFullPath = (value) =>
  value.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";

const getQueryString = (value) => {
  const queryIndex = value.indexOf("?");

  if (queryIndex === -1) {
    return "";
  }

  return value.slice(queryIndex + 1).split("#", 1)[0];
};

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

export const normalizeAuthRedirectUri = (value) => {
  const redirectUri = typeof value === "string" ? value.trim() : "";

  if (!redirectUri) {
    return "/";
  }

  const path = getPathFromFullPath(redirectUri);

  if (path === LOGIN_PATH) {
    return normalizeAuthRedirectUri(
      new URLSearchParams(getQueryString(redirectUri)).get("redirect_uri")
    );
  }

  if (
    !redirectUri.startsWith("/") ||
    redirectUri.startsWith("//") ||
    path.startsWith("/auth/")
  ) {
    return "/";
  }

  return redirectUri;
};

export const buildLoginRedirectLocation = (value) => ({
  path: LOGIN_PATH,
  query: {
    redirect_uri: normalizeAuthRedirectUri(value),
  },
});

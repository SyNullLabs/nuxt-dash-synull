import {
  buildLoginRedirectLocation,
  clearAuthToken,
  getAuthToken,
  normalizeAuthRedirectUri,
  setAuthToken,
} from "@/composables/useSession.js";

describe("useSession", () => {
  const originalClientFlag = process.client;

  beforeEach(() => {
    Object.defineProperty(process, "client", {
      value: true,
      configurable: true,
      writable: true,
    });

    localStorage.clear();
  });

  afterAll(() => {
    Object.defineProperty(process, "client", {
      value: originalClientFlag,
      configurable: true,
      writable: true,
    });
  });

  test("stores and clears auth token in localStorage", () => {
    expect(getAuthToken()).toBeNull();

    setAuthToken("test-token");
    expect(getAuthToken()).toBe("test-token");

    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });

  test("normalizes nested login redirects to the final safe path", () => {
    expect(normalizeAuthRedirectUri("/products?group=1")).toBe(
      "/products?group=1"
    );
    expect(
      normalizeAuthRedirectUri("/auth/login?redirect_uri=%2Forders%3Fpage%3D2")
    ).toBe("/orders?page=2");
    expect(
      normalizeAuthRedirectUri("/auth/login?redirect_uri=/auth/login?redirect_uri=/")
    ).toBe("/");
    expect(normalizeAuthRedirectUri("//evil.example")).toBe("/");
  });

  test("builds login redirect locations with normalized redirect params", () => {
    expect(
      buildLoginRedirectLocation("/auth/login?redirect_uri=%2Fservices").query
        .redirect_uri
    ).toBe("/services");
  });
});

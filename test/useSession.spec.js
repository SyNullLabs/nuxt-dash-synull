import {
  clearAuthToken,
  getAuthToken,
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
});

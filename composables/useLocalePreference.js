export const supportedLocaleCodes = ["zh-CN", "zh-TW", "en-US"];

const localeAliasMap = {
  zh: "zh-CN",
  "zh-CN": "zh-CN",
  "zh-Hans": "zh-CN",
  "zh-SG": "zh-CN",
  "zh-TW": "zh-TW",
  "zh-Hant": "zh-TW",
  "zh-HK": "zh-TW",
  en: "en-US",
  "en-US": "en-US",
};

export const normalizeLocaleCode = (localeCode = "") => {
  if (localeAliasMap[localeCode]) {
    return localeAliasMap[localeCode];
  }

  if (localeCode.startsWith("zh")) {
    return "zh-CN";
  }

  if (localeCode.startsWith("en")) {
    return "en-US";
  }

  return "zh-CN";
};

export const persistLocaleCode = (localeCode) => {
  const normalizedCode = normalizeLocaleCode(localeCode);

  if (process.client) {
    document.cookie = `i18n_redirected=${normalizedCode}; max-age=31536000; path=/`;
  }

  return normalizedCode;
};

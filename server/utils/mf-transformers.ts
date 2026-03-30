import CryptoJS from "crypto-js";

const maskPhoneNumber = (phone?: string) => {
  if (!phone) {
    return phone;
  }

  return phone.replace(/(\d{2})\d{6}(\d{1})/, "$1*******$2");
};

const decorateUserProfile = (profile?: Record<string, any>) => {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    phonenumber: maskPhoneNumber(profile.phonenumber),
    email_md5: profile.email
      ? CryptoJS.MD5(profile.email).toString()
      : profile.email_md5,
  };
};

const decorateClientProfile = (profile?: Record<string, any>) => {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    phonenumber: maskPhoneNumber(profile.phonenumber),
  };
};

export const mergeDashboardPayload = (
  dashboardResponse: Record<string, any>,
  userInfoResponse: Record<string, any>
) => {
  const combined = {
    ...(dashboardResponse.data || {}),
    ...userInfoResponse,
  };

  return {
    ...combined,
    user: decorateUserProfile(combined.user),
    client: decorateClientProfile(combined.client),
  };
};

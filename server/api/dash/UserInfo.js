import { $fetch } from "ofetch";
import CryptoJS from "crypto-js";

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event);
  const authorization = "JWT " + headers["authorization"];

  if (!authorization) {
    return {
      success: false,
      message: "未提供授权令牌",
    };
  }

  try {
    const infoResponse = await $fetch(process.env.BACK_URL + "/index", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
      },
    });

    const userInfoResponse = await $fetch(process.env.BACK_URL + "/user_info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
      },
    });

    if (infoResponse.status === 200 && userInfoResponse.status === 200) {
      // 合并两个响应的数据
      const combinedData = {
        ...infoResponse.data,
        ...userInfoResponse,
      };

      // 对手机号进行打码处理
      if (combinedData.user && combinedData.user.phonenumber) {
        const phone = combinedData.user.phonenumber;
        combinedData.user.phonenumber = phone.replace(
          /(\d{2})\d{6}(\d{1})/,
          "$1*******$2"
        );
      }

      if (combinedData.client && combinedData.client.phonenumber) {
        const phone = combinedData.client.phonenumber;
        combinedData.client.phonenumber = phone.replace(
          /(\d{2})\d{6}(\d{1})/,
          "$1*******$2"
        );
      }

      if (combinedData.user && combinedData.user.email) {
        const emailmd5 = CryptoJS.MD5(combinedData.user.email).toString();
        combinedData.user.email_md5 = emailmd5; // 添加 email_md5 字段
      }

      return {
        success: true,
        data: combinedData,
        message: "成功获取用户信息",
      };
    } else {
      return {
        success: false,
        message: infoResponse.msg || userInfoResponse.msg || "获取用户信息失败",
      };
    }
  } catch (error) {
    console.error("获取用户信息时发生错误", error);
    return {
      success: false,
      message: "获取用户信息过程中发生错误",
    };
  }
});

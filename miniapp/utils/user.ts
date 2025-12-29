import request from "@/utils/request";
import apiUser from "@/api/user";

export const autoLogin = async () => {
  return new Promise((resolve, reject) => {
    uni.login({
      success: async (res) => {
        if (res.code) {
          try {
            const loginRes = await request.post("/api/Login/autoLogin", {
              code: res.code,
            });
            resolve(loginRes);
            saveLocalUserInfo(loginRes);
          } catch (e) {
            resolve(null);
          }
        } else {
          reject(new Error("登录失败：" + res.errMsg));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
};

// 获取手机并注册
export const loginGetPhoneNumber = async (code) => {
  return new Promise(async (resolve, reject) => {
    const {
      data: { tel },
    } = await apiUser.getPhone({ code });
    uni.login({
      async success(res) {
        if (res.code) {
          const registerRes = await register({
            name: "name",
            tel,
            code: res.code,
          });
          resolve(registerRes);
        } else {
          reject(new Error("登录失败：" + res.errMsg));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
};

export const register = async (data) => {
  const pid = uni.getStorageSync("pid");
  const params = pid ? { ...data, pid } : data;
  const loginRes = await request.post("/api/Login/register", params);
  saveLocalUserInfo(loginRes);
  return loginRes;
};

export const logout = async () => {
  try {
    uni.clearStorageSync(); // 清除所有缓存
    uni.navigateTo({
      url: "/pages/index/index",
    });
  } catch (e) {
    console.error("清除缓存失败：", e);
  }
};

/**
 * 获取本地缓存中的用户信息
 * @returns 用户信息对象（如无信息则返回 null）
 */
export function getUserInfoFromStorage() {
  try {
    const userInfo = uni.getStorageSync("userInfo");
    if (userInfo && typeof userInfo === "object") {
      return userInfo;
    } else {
      return null;
    }
  } catch (e) {
    console.error("获取本地用户信息失败:", e);
    return null;
  }
}

function saveLocalUserInfo(res) {
  const token = res?.data?.token;
  if (!token) return;
  const currentTime = res?.time * 1000;
  uni.setStorageSync("userInfo", res?.data || {});
  uni.setStorageSync("token", {
    token,
    expire: currentTime + 60 * 60 * 24 * 1000, // 过期时间设置为 1 天（86400000 毫秒）
  });
}

export function getLocalToken() {
  const localToken = uni.getStorageSync("token");
  const { token = "", expire } = localToken || {};
  const now = Date.now();
  return now < expire ? token : "";
}

export async function getCode() {
  const codeName = "codeUrl";
  // const codeUrl = uni.getStorageSync(codeName);
  // if (codeUrl) return codeUrl;
  const codeRes = await apiUser.getDistributionCode();
  // uni.setStorageSync(codeName, codeRes?.data?.path || "");
  return codeRes?.data?.path || "";
}

// 获取用户地点，比如成都春熙路
export async function getUserAddress() {
  // const locationRes = await getUserLocation();
  const locationRes = { latitude: 29.56301, longitude: 106.55155 };
  const { latitude: lat, longitude: lng } = locationRes;
  apiUser.getLocation({ lat, lng }).then((res) => {
    console.log("res---------", res);
  });
}

export function getUserLocation(): Promise<WechatMiniprogram.GetLocationSuccessCallbackResult> {
  return new Promise((resolve, reject) => {
    // 检查授权状态
    uni.getSetting({
      success: (settingRes) => {
        const hasAuth = settingRes.authSetting["scope.userLocation"];

        if (hasAuth === false) {
          uni.showModal({
            title: "授权提示",
            content: "需要获取位置信息，请手动授权",
            success(modalRes) {
              if (modalRes.confirm) {
                uni.openSetting({
                  success(openRes) {
                    if (openRes.authSetting["scope.userLocation"]) {
                      // ✅ 用户重新授权成功
                      requestLocation(resolve, reject);
                    } else {
                      reject(new Error("用户未授权定位"));
                    }
                  },
                });
              } else {
                reject(new Error("用户取消打开设置"));
              }
            },
          });
        } else if (hasAuth === true) {
          requestLocation(resolve, reject);
        } else {
          uni.authorize({
            scope: "scope.userLocation",
            success: () => requestLocation(resolve, reject),
            fail: () => reject(new Error("用户拒绝授权")),
          });
        }
      },
      fail: reject,
    });
  });
}

function requestLocation(
  resolve: (res: WechatMiniprogram.GetLocationSuccessCallbackResult) => void,
  reject: (err: any) => void
) {
  uni.getLocation({
    type: "gcj02",
    success: resolve,
    fail: reject,
  });
}

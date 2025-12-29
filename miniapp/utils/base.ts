import dayjs from "dayjs";
import JSEncrypt from "jsencrypt";
import { baseConfig } from "./constants";
import { getLocalToken } from "./user";
import { isNetworkImage } from "./upload";

export const rsaEncrypt = (str) => {
  if (str instanceof Object) {
    str = JSON.stringify(str);
  }
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(baseConfig.api_encryptor.rsa_public);
  return encryptor.encrypt(str);
};

export function getThumbnailUrl(url: string, maxWidth = 300): string {
  if (!url) return "";
  if (!isNetworkImage(url)) return url;
  if (!url.includes("?x-tos-process=")) {
    return `${url}?x-tos-process=image/resize,m_lfit,w_${maxWidth}/quality,q_100/format,webp`;
  }
  return url;
}

// 方法：下载图片并保存到相册
export const downloadAndSaveImage = (url: string) => {
  // 1. 获取权限
  uni.authorize({
    scope: "scope.writePhotosAlbum",
    success() {
      // 2. 下载图片
      uni.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200) {
            // 3. 保存到相册
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({
                  title: "已保存到相册",
                  icon: "success",
                });
              },
              fail: (err) => {
                console.error("保存失败", err);
                uni.showToast({
                  title: "保存失败",
                  icon: "none",
                });
              },
            });
          } else {
            uni.showToast({
              title: "下载失败",
              icon: "none",
            });
          }
        },
        fail(err) {
          console.error("下载失败", err);
          uni.showToast({
            title: "下载失败",
            icon: "none",
          });
        },
      });
    },
    fail() {
      uni.showModal({
        title: "提示",
        content: "需要授权保存图片到相册，是否前往设置？",
        success(res) {
          if (res.confirm) {
            uni.openSetting({});
          }
        },
      });
    },
  });
};

// 主函数：判断登录，执行 fn 或触发授权弹窗
export function checkLoginThen(fn: () => void) {
  const token = getLocalToken();
  if (token) {
    fn();
  } else {
    uni.$emit("showPhoneAuthModal", fn);
  }
}

export function copyToClipboard(text: string) {
  uni.setClipboardData({
    data: text,
    success() {
      uni.showToast({ title: "复制成功", icon: "success" });
    },
    fail() {
      uni.showToast({ title: "复制失败", icon: "none" });
    },
  });
}

export async function getImageInfo(url) {
  // 如果是网络图，先下载
  if (isNetworkImage(url)) {
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.getImageInfo({
              src: res.tempFilePath,
              success: resolve,
              fail: reject,
            });
          } else {
            reject(res);
          }
        },
        fail: reject,
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      uni.getImageInfo({
        src: url,
        success: resolve,
        fail: reject,
      });
    });
  }
}

/**
 * 生成一个带定位和日期信息的 SVG 图
 * @param {Object} options
 * @param {string} options.imageUrl 背景图链接（必须是网络图）
 * @param {string} options.location 位置，如 "成都·春熙路"
 * @param {string} options.date 日期，如 "2025-07-04"
 * @param {number} [width=750] 图宽
 * @param {number} [height=1334] 图高
 */
export function generateLocationSvg({
  imageUrl,
  location,
  date,
  width = 750,
  height = 1334,
}) {
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <image href="${imageUrl}" x="0" y="0" width="${width}" height="${height}" />
      <text x="40" y="${
        height - 40
      }" font-size="32" fill="#ffffff" font-family="PingFang SC">
        ${location} ｜ ${date}
      </text>
    </svg>
  `.trim();
}

// 获取日期星期几
export function getWeek(date: string) {
  const d = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const dayOfWeek = dayjs().day();
  return d[dayOfWeek];
}

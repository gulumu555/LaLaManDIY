import TOS from "@volcengine/tos-sdk";
import apiUser from "@/api/user";
import { getUserInfoFromStorage } from "@/utils/user";

// 选择图片，返回图片url
export async function chooseImage(settings = {}) {
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count: 1, // 最多可选张数
			sourceType: ["album"], // 只从相册选择
			success: async (res : any) => {
				const tempFilePath = res.tempFilePaths[0];
				// 检查文件扩展名（如 .gif）
				if (tempFilePath.toLowerCase().endsWith(".gif")) {
					uni.showModal({
						title: "不支持动态图片",
						content: "请选择其他图片",
						icon: "none",
						showCancel: false,
					});
					reject(new Error("不支持动态图片"));
					return;
				}
				resolve(tempFilePath);
			},
			fail: (err) => {
				console.error("选择失败", err);
				reject(err);
			},
		});
	});
}

// 选择并上传图片
export async function chooseAndUploadImage({ callbacks, settings = {} }) {
	uni.chooseImage({
		count: 1, // 最多可选张数
		sourceType: ["album"], // 只从相册选择
		sizeType: ["original"], // 原图
		success: async (res : any) => {
			let url = "";
			try {
				uni.showLoading({ title: "上传中" });
				const uploadRes = await handleUpload(res.tempFilePaths[0]);
				uni.hideLoading();
				url = uploadRes.url;
				if (!url) {
					if (callbacks?.onFail) {
						callbacks.onFail(new Error("上传失败"));
						return;
					}
					uni.showModal({
						title: "图片上传失败",
						content: uploadRes?.errMsg || "上传失败，请稍后再试",
						showCancel: false,
					});
					return;
				}
				uni.setStorageSync("chooseImage", url);
			} catch (e) {
				if (callbacks?.onFail) {
					callbacks.onFail(e);
					return;
				}
				console.error("上传失败", e);
				uni.showModal({
					title: "图片上传失败",
					content: e?.errMsg || "上传失败，请稍后再试",
					showCancel: false,
				});
			}
			callbacks?.onSuccess?.(url);
		},
		fail: (err) => {
			callbacks?.onFail?.(err);
			console.error("选择失败", err);
		},
		...settings,
	});
}

export function isNetworkImage(url : string) {
	if (!url || typeof url !== "string") return false;
	return url.includes('volces.com');
}

export async function handleUpload(filePath : string) {
	// 判断是否是网络图
	if (isNetworkImage(filePath)) {
		return { url: filePath };
	}
	try {
		// 获取 STS 凭证并初始化 TOS 客户端（按你已有逻辑）
		const credentials = await getStsCredentials();
		const { AccessKeyId, SecretAccessKey, SessionToken, bucket, region } = credentials
		const client = new TOS({
			accessKeyId: AccessKeyId,
			accessKeySecret: SecretAccessKey,
			stsToken: SessionToken,
			region,
			bucket,
		});

		const userInfo = getUserInfoFromStorage();

		// 获取文件扩展名（如 .jpg、.png、.jpeg）
		const extMatch = filePath.match(/\.(\w+)$/);
		const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
		const objectKey = generateObjectKey(userInfo.id, ext);

		const preSignedUrl = client.getPreSignedUrl({
			method: "PUT",
			bucket,
			key: objectKey,
		});

		// 读取文件内容为 ArrayBuffer
		const fs = uni.getFileSystemManager();
		const fileBuffer = fs.readFileSync(filePath); // 注意：小程序端读出来的是 ArrayBuffer

		// 根据扩展名判断 Content-Type
		let contentType = "image/jpeg";
		if (ext === "png") contentType = "image/png";
		else if (ext === "gif") contentType = "image/gif";
		else if (ext === "webp") contentType = "image/webp";

		// 使用 uni.request 上传图片
		return new Promise((resolve, reject) => {
			uni.request({
				url: preSignedUrl,
				method: "PUT",
				data: fileBuffer,
				header: {
					"Content-Type": contentType, // 根据实际图片类型判断
				},
				success(res) {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						const pureUrl = preSignedUrl.split("?")[0];
						resolve({ url: pureUrl });
					} else {
						reject(new Error(`Upload failed: ${res.statusCode}`));
					}
				},
				fail(err) {
					reject(err);
				},
			});
		});
	} catch (e) {
		console.error("上传失败", e);
		throw e;
	}
}

function generateObjectKey(userId : number | string, ext : string) : string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const dateStr = `${year}${month}${day}`;
	const randomStr = Math.random().toString(36).slice(2, 8); // 6位字母数字混合
	return `upload/${dateStr}/photo_order_${userId}_${randomStr}.${ext}`;
}

// 获取火山云 TOS 临时上传凭证（带缓存）
export async function getStsCredentials() {
	const key = "TOS_STS_CACHE";
	const cache = uni.getStorageSync(key);
	const now = Date.now();

	if (cache && cache.credentials && cache.credentials.bucket && cache.credentials.region && now < cache.expire) {
		return cache.credentials;
	}

	const res = await apiUser.getCertification();

	const credentials = res?.data?.Result?.Credentials || {};
	credentials.bucket = res?.data?.bucket
	credentials.region = res?.data?.region
	const { SecretAccessKey, ExpiredTime, CurrentTime } = credentials;

	if (!SecretAccessKey || !ExpiredTime || !CurrentTime) {
		throw new Error("获取 TOS 凭证失败");
	}

	const expire = new Date(ExpiredTime).getTime();

	uni.setStorageSync(key, {
		credentials,
		expire: expire - 60 * 1000,
	});

	return credentials;
}
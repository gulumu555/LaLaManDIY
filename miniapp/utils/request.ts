import { rsaEncrypt } from "./base";
import { autoLogin, getLocalToken } from "./user";
import ENV, { getAppEnv } from '../utils/env.ts'

// 声明uni类型
declare const uni : any;

class HttpClient {
	private baseURL : string;

	constructor(baseURL = "") {
		this.baseURL = baseURL;
	}

	// 清除 undefined 字段
	cleanData(data : any) {
		if (typeof data !== "object" || data === null) return data;
		return Object.fromEntries(
			Object.entries(data).filter(([_, value]) => value !== undefined)
		);
	}

	// 获取登录code
	getLoginCode() : Promise<string> {
		return new Promise((resolve, reject) => {
			uni.login({
				success: (res) => {
					if (res.code) {
						resolve(res.code);
					} else {
						reject(new Error("获取登录code失败：" + res.errMsg));
					}
				},
				fail: (err) => {
					reject(err);
				},
			});
		});
	}

	// 通用请求方法
	request(url : string, options : any = {}) {
		const {
			method = "GET",
			headers = {},
			body = null,
			showError = true, // 控制是否自动展示错误
			timeout = 5000, // 默认超时时间 5 秒
		} = options;

		const token = getLocalToken();
		const _securityToken = rsaEncrypt({
			token,
			time: Date.now(),
		});

		const cleanedBody = this.cleanData(body);
		return new Promise((resolve, reject) => {
			let isTimeout = false;
			let requestTask : any = null;
			const timer = setTimeout(() => {
				isTimeout = true;
				if (requestTask && typeof requestTask.abort === 'function') {
					requestTask.abort();
				}
				uni.showToast({
					title: "请求超时，请稍后重试",
					icon: "none",
				});
				reject(new Error("请求超时"));
			}, timeout);
			requestTask = uni.request({
				url: this.baseURL + url,
				method,
				header: {
					token: token ? _securityToken : "",
					"Content-Type": "application/json",
					...headers,
				},
				data: cleanedBody,
				success: async (res) => {
					if (isTimeout) return;
					clearTimeout(timer);
					const { data } = res;
					const { code, message: errorMessage = "" } = data;

					if (code === -3) {
						// uni.$modalRecharge.show();
						// return;
					}

					if (errorMessage === "登录已失效" || errorMessage === "非法请求") {
						uni.hideLoading();
						// uni.showToast({ title: errorMessage, icon: 'exception' })
						console.error(errorMessage);
						// return
						// 登录失效
						uni.removeStorageSync("token");
						uni.removeStorageSync("userInfo");

						try {
							// 获取新的登录code并执行自动登录
							const loginCode = await this.getLoginCode();
							await autoLogin(loginCode);
							// 登录成功后重新执行原请求
							const retryResult = await this.request(url, options);
							resolve(retryResult);
						} catch (loginError) {
							// 自动登录失败，返回错误
							if (showError) {
								uni.showToast({
									title: "登录失败，请重新登录",
									icon: "none",
								});
							}
							reject(loginError);
						}
						return;
					}

					if (code !== 1 && code !== -3) {
						if (showError) {
							uni.showToast({
								title: errorMessage || "请求错误",
								icon: "none",
							});
						}
						reject(new Error(errorMessage || "请求失败"));
						return;
					}

					resolve(data);
				},
				fail: (err) => {
					if (isTimeout) return;
					clearTimeout(timer);
					uni.showToast({
						title: "网络异常，请稍后再试",
						icon: "none",
					});
					reject(err);
				},
			});
		});
	}

	// GET
	get(url : string, params : any = {}) {
		const queryString = Object.keys(params)
			.filter((key) => params[key] !== undefined)
			.map(
				(key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
			)
			.join("&");
		return this.request(url + (queryString ? `?${queryString}` : ""), {
			method: "GET",
		});
	}

	// POST
	post(url : string, body : any = {}, headers : any = {}) {
		return this.request(url, {
			method: "POST",
			body,
			headers,
		});
	}

	// PUT
	put(url : string, body : any = {}, headers : any = {}) {
		return this.request(url, {
			method: "PUT",
			body,
			headers,
		});
	}

	// DELETE
	delete(url : string, headers : any = {}) {
		return this.request(url, {
			method: "DELETE",
			headers,
		});
	}

	// 文件上传
	uploadFile(url : string, filePath : string, fieldName : string = "file") {
		const token = uni.getStorageSync("token");
		const _securityToken = rsaEncrypt({
			token,
			time: Date.now(),
		});

		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: this.baseURL + url,
				filePath,
				name: fieldName,
				header: {
					token: _securityToken,
				},
				success: (res) => {
					let data : any = {};
					try {
						data = JSON.parse(res.data);
					} catch (e) {
						return reject(new Error("上传响应格式错误"));
					}

					if (data.code !== 1) {
						uni.showToast({
							title: data.message || "上传失败",
							icon: "none",
						});
						return reject(data);
					}

					resolve(data);
				},
				fail: (err) => {
					uni.showToast({
						title: "上传失败",
						icon: "none",
					});
					reject(err);
				},
			});
		});
	}
}



const currentEnv = getAppEnv()
const apiClient = new HttpClient(ENV[currentEnv].baseURL);

export default apiClient;
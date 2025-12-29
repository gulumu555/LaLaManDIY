const ENV = {
	development: {
		//baseURL: 'https://lalaman.novsoft.cn',
		baseURL: 'https://www.lalaman.cn',
		envName: '开发环境'
	},
	staging: {
		//baseURL: 'https://lalaman.novsoft.cn',
		baseURL: 'https://www.lalaman.cn',
		envName: '体验版'
	},
	production: {
		baseURL: 'https://www.lalaman.cn',
		envName: '正式版'
	}
}

// utils/env.js
export function getAppEnv() {
	let currentEnv = 'development'
	// #ifdef MP-WEIXIN
	const accountInfo = wx.getAccountInfoSync()
	/**
	 * accountInfo.miniProgram.envVersion 可取值：
	 * - develop（开发版）
	 * - trial（体验版）
	 * - release（正式版）
	 */
	currentEnv = accountInfo.miniProgram.envVersion
	// #endif

	// console.log('当前环境:', currentEnv)
	// uni.showModal({
	// 	title: currentEnv
	// })

	switch (currentEnv) {
		case "develop":
			return "development"; // 映射成前端习惯的 development
		case "trial":
			return "staging";     // 你可以自己定义，比如测试/体验环境
		case "release":
			return "production";
		default:
			return "development";
	}
}


export default ENV

<template>
	<Header icon="/static/options.svg" :iconTitle="configInfo?.title" :back="() => navigatorTo('/pages/user/index')">
	</Header>
	<view class="content">
		<image class="logo" src="/static/logo.svg" mode="aspectFit"
			:style="{ 'transform': `translate(-50%,${statusBarHeight * scale}px) scale(${scale})` }"></image>
		<InfiniteList :fetchFn="requestData" :scroll="handleScroll"
			:styles="{ width: '100%', height: 'calc(100vh - 47px - 78rpx)' }">
			<template #default="{ item, index }">
				<view style="padding-top: 246rpx;background-color: #fff;" v-if="index === 0"></view>
				<view class="image-list">
					<image class="image" :src="getThumbnailUrl(item.img, 500)" mode="widthFix"></image>
					<view class="desc">
						{{ item.desc }}
					</view>
				</view>
			</template>
		</InfiniteList>
	</view>
	<view class="footer-float-wrapper" v-show="isLoadedUser">
		<!-- shopping 图标 -->
		<!-- <template v-if="loggedIn">
			<image class="user" src="/static/shopping.svg" mode="aspectFit" @click="handleChooseImage('print')" />
		</template>
		<template v-else>
			<button open-type="getPhoneNumber"
				@getphonenumber="e => handleGetPhoneNumber(e, handleChooseImage('print'))" class="clean-button">
				<image class="user" src="/static/shopping.svg" mode="aspectFit" />
			</button>
		</template> -->
		<image class="user" src="/static/shopping.svg" mode="aspectFit" @click="uni.showModal({
			title: '敬请期待',
			showCancel: false
		})" />


		<!-- addition 图标 -->
		<template v-if="loggedIn">
			<image class="addition" src="/static/addition.svg" mode="aspectFit" @click="handleChooseImage" />
		</template>
		<template v-else>
			<button open-type="getPhoneNumber" @getphonenumber="e => handleGetPhoneNumber(e, handleChooseImage)"
				class="clean-button">
				<image class="addition" src="/static/addition.svg" mode="aspectFit" />
			</button>
		</template>

		<!-- user 图标 -->
		<template v-if="loggedIn">
			<image class="user" src="/static/user.svg" mode="aspectFit" @click="navigatorTo('/pages/user/index')" />
		</template>
		<template v-else>
			<button open-type="getPhoneNumber"
				@getphonenumber="e => handleGetPhoneNumber(e, () => navigatorTo('/pages/user/index'))"
				class="clean-button">
				<image class="user" src="/static/user.svg" mode="aspectFit" />
			</button>
		</template>
	</view>
</template>

<script lang="ts">
	import Header from '@/components/Header.vue'
	import InfiniteList from '@/components/InfiniteList.vue'
	import { autoLogin, login, loginGetPhoneNumber } from '@/utils/user'
	import { checkLoginThen, getThumbnailUrl } from '@/utils/base'
	import { getLocalToken } from '@/utils/user'
	import { chooseImage } from '@/utils/upload'
	import apiUser from '@/api/user'
	import apiIndex from '@/api/index'
	import { config } from 'process'
	export default {
		components: {
			Header,
			InfiniteList,
		},
		data() {
			return {
				getThumbnailUrl,
				title: 'Hello',
				code: '',
				dataList: [],
				chooseData: [],
				openChooseImage: false,
				loggedIn: false,
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				scale: 1,
				isLoadedUser: false,
				configInfo: {}
			}
		},
		onLoad(options) {
			this.initPid(options)
			this.getConfig();
			autoLogin().then((res) => {
				if (res?.data?.is_register === 1) {
					this.loggedIn = !!getLocalToken()
				}
			}).finally(() => {
				this.isLoadedUser = true
			})
		},
		methods: {
			getConfig() {
				apiUser.getConfig().then(res => {
					this.configInfo = res.data
				})
			},
			initPid(options) {
				const { pid = 0, scene } = options || {}
				if (scene) {
					try {
						const decoded = decodeURIComponent(scene)
						const sceneParams = {}
						decoded.split('&').forEach(pair => {
							const [key, val] = pair.split('=')
							sceneParams[key] = val
						})
						const from_id = decodeURIComponent(sceneParams?.from_id || pid)

						if (from_id)
							uni.setStorageSync('pid', from_id)
						else
							uni.setStorageSync('pid', 0)
					} catch (error) {
						console.error('解析scene参数失败:', error)
						uni.setStorageSync('pid', pid || 0)
					}
				} else {
					uni.setStorageSync('pid', pid || 0)
				}
			},
			async handleGetPhoneNumber(e, callback) {
				if (e.detail.errMsg !== 'getPhoneNumber:ok') {
					uni.showToast({
						title: '授权失败',
						icon: 'none'
					})
					return
				}
				const autoLoginRes = await autoLogin()
				const { is_register, token: autoLoginToken = '' } = autoLoginRes || {}
				if (is_register === 1 && autoLoginToken) return

				const loginGetRes = await loginGetPhoneNumber(e.detail.code)
				const token = loginGetRes?.data?.token || ''
				if (token) {
					this.loggedIn = getLocalToken()
					callback && callback()
				}
			},
			async requestData() {
				const listRes = await apiIndex.list()
				listRes.data.data = listRes.data
				return listRes
			},
			navigatorTo(url : string) {
				checkLoginThen(() => {
					uni.navigateTo({ url });
				});
			},
			async handleChooseImage(type) {
				const tmpUrl = await chooseImage();
				if (!tmpUrl) return;
				const baseUrl =
					type === "print"
						? "/pages/print/index?categoryOriginId=1&url="
						: "/pages/styleTransfer/index?categoryOriginId=2&url=";
				const fullUrl = `${baseUrl}${encodeURIComponent(tmpUrl)}`;
				uni.navigateTo({
					url: fullUrl,
				});
			},
			handleCancelChooseImage() {
				this.openChooseImage = false;
			},
			handleScroll(e) {
				const scrollTop = e.detail.scrollTop;
				const minScale = 0.7;
				const maxScale = 1;
				const threshold = 300;

				const scale = Math.max(minScale, maxScale - scrollTop / threshold);
				this.scale = scale;
			}
		},
	}
</script>

<style lang="less" scoped>
	@height: 246rpx;

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.logo {
		width: 98rpx;
		height: 98rpx;
		position: fixed;
		left: 50%;
		top: 140rpx;
		z-index: 9;
		transition: transform 0.1s ease;
	}

	.image-list {
		position: relative;

		.image {
			width: 100vw;
			display: block;
		}

		.desc {
			position: absolute;
			left: 0;
			bottom: 50rpx;
			width: 100vw;
			text-align: center;
			font-size: 24rpx;
			color: #fff;
			text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
		}
	}

	.btn-user {
		background-color: transparent;
		padding: 0;
		margin: 0;

		&::after {
			border: none;
		}
	}

	.footer-float-wrapper {
		bottom: 88rpx;
		left: 28rpx;
		right: 28rpx;

		.user {
			width: 138rpx;
			height: 138rpx;
		}

		.addition {
			width: 216rpx;
			height: 216rpx;
		}
	}
</style>
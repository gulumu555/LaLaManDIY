<template>
	<Header>账号设置</Header>
	<view class="settings-wrapper">
		<view class="card content">
			<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="clean-button">
				<view class="list list-avatar">
					<view class="list-left">
						头像
					</view>
					<image :src="userInfo?.avatar ? userInfo?.avatar : '/static/user.svg'" class="list-right"
						mode="widthFix" style="width: 90rpx;height: 90rpx;"></image>
				</view>
			</button>
			<button @tap="getProfile" class="clean-button">
				<view class="list">
					<view class="list-left">
						用户名
					</view>
					<view class="list-right">
						{{ userInfo?.nickname || '' }}
					</view>
				</view>
			</button>
			<button open-type="getPhoneNumber" @getphonenumber="handleGetPhoneNumber" class="clean-button">
				<view class="list">
					<view class="list-left">
						手机号码
					</view>
					<view class="list-right">
						{{ userInfo?.tel || '' }}
					</view>
				</view>
			</button>
			<navigator url="/pages/user/address">
				<view class="list">
					<view class="list-left">
						收货地址
					</view>
				</view>
			</navigator>
			<navigator url="/pages/user/agreement?type=user_agreement">
				<view class="list">
					<view class="list-left">
						用户协议
					</view>
				</view>
			</navigator>
			<navigator url="/pages/user/agreement?type=privacy_agreement">
				<view class="list">
					<view class="list-left">
						隐私协议
					</view>
				</view>
			</navigator>
			<navigator url="/pages/user/agreement?type=payment_agreement">
				<view class="list">
					<view class="list-left">
						支付服务协议
					</view>
				</view>
			</navigator>
			<navigator url="/pages/user/agreement?type=withdrawal_instruction">
				<view class="list" style="border-bottom: none;">
					<view class="list-left">
						提现说明
					</view>
				</view>
			</navigator>
		</view>
	</view>
	<uni-popup ref="popup" type="bottom">
		<view
			style="width: 100vw;height: 50vh;border-radius: 8px 8px 0 0;background-color: #fff;padding: 48rpx;box-sizing: border-box;">
			<view style="font-size: 36rpx;">
				昵称设置：
			</view>
			<view style="margin-top: 24rpx;">
				<input type="nickname" class="btn-2" v-model="nickname" placeholder="请输入昵称"
					style="box-sizing: border-box;padding-left: 24rpx;" />
			</view>
			<view style="margin-top: 48rpx;">
				<button class="btn-3" @click="handleSaveNickname">提交</button>
			</view>
			<view style="margin-top: 24rpx;">
				<button class="btn-2" @click="cancelPop">取消</button>
			</view>
		</view>
	</uni-popup>
	<PhoneAuthModal />
</template>

<script>
	import Header from '@/components/Header.vue'
	import PhoneAuthModal from '@/components/global/PhoneAuthModal.vue'
	import apiUser from '@/api/user'
	import {
		loginGetPhoneNumber
	} from '@/utils/user'
	import {
		logout,
	} from '@/utils/user'
	import {
		handleUpload
	} from "@/utils/upload";

	export default {
		components: {
			Header,
			PhoneAuthModal
		},
		data() {
			return {
				userInfo: null,
				nickname: ''
			};
		},
		onLoad() {
			this.reqGetUserInfo()
		},
		methods: {
			async onChooseAvatar(e) {
				const avatarUrl = e.detail?.avatarUrl
				const res = await handleUpload(avatarUrl)
				if (res.url) {
					this.respUserInfo({
						avatar: res.url
					})
				}
			},
			handleSaveNickname() {
				this.respUserInfo({
					nickname: this.nickname
				}).then(res => {
					this.cancelPop()
				})
			},
			getProfile() {
				this.$refs.popup.open('bottom')
			},
			cancelPop() {
				this.$refs.popup.close();
			},
			// 获取用户信息
			async reqGetUserInfo(e) {
				const res = await apiUser.getUserInfo()
				this.userInfo = res.data
			},
			async handleGetPhoneNumber(e) {
				if (e.detail.errMsg !== 'getPhoneNumber:ok') {
					uni.showToast({
						title: '授权失败',
						icon: 'none'
					})
					return
				}
				const phoneRes = await apiUser.getPhone({
					code: e.detail.code
				})
				this.respUserInfo({
					tel: phoneRes?.data?.tel || '',
				})

			},
			async respUserInfo(data) {
				const {
					avatar = '', tel = '', nickname = ''
				} = this.userInfo
				const userInfo = {
					avatar,
					tel,
					nickname,
					...data
				}
				const updateRes = await apiUser.updateInfo(userInfo)
				if (updateRes.code === 1) {
					uni.showToast({
						title: '更新成功',
						icon: 'success'
					})
					uni.setStorageSync('userInfo', userInfo)
					this.reqGetUserInfo()
				}
			},
			onLogout() {
				logout()
			}
		}
	}
</script>

<style lang="less" scoped>
	.settings-wrapper {
		margin: 30rpx;

		.content {
			padding: 0 30rpx;
			box-sizing: border-box;

			.list {
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-bottom: 1rpx solid #DBDBE0;
				padding: 32rpx 0;
				background: url(/static/arrow.svg) right 8rpx center no-repeat;
				background-size: 32rpx;
				font-size: 28rpx !important;

				&-right {
					margin-right: 54rpx;
				}

				&-avatar {
					.list-right {
						width: 90rpx;
					}
				}
			}
		}
	}

	.btn-wrapper {
		position: fixed;
		bottom: 84rpx;
		left: 30rpx;
		right: 30rpx;
	}
</style>
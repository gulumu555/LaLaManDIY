<template>
	<Header></Header>
	<view class="user-container">
		<view class="user-content">
			<view class="distribution-wrapper">
				<DistributionQRcode>
					<image src="/static/distribution.svg" class="distribution" mode="widthFix"></image>
				</DistributionQRcode>
			</view>
			<view class="card user-info-wrapper">
				<view class="user-info">
					<image class="user-info-vector" :src="userInfo?.avatar || '/static/vector.svg'" mode="aspectFit">
					</image>
					<view class="user-info-message">
						<view class="user-info-message-nickname">
							{{ userInfo.nickname || '-' }}
							<navigator url="/pages/user/settings">
								<image class="icon-edit" src="/static/icon-edit.svg" mode="widthFix"></image>
							</navigator>
						</view>
						<view class="user-info-message-tel">
							{{ userInfo.tel }}
						</view>
					</view>
				</view>
				<view class="addition-info">
					<navigator url="/pages/user/recharge">
						<span class="addition-info-second">剩余次数</span>
					</navigator>
					<navigator url="/pages/user/recharge">
						<span class="addition-info-count">{{ userInfo.num_balance }}</span>
					</navigator>
					<ModalRecharge :onSuccess="requestUserInfo">
						<span class="addition-info-pay">
							立即充值
							<image class="icon" src="/static/frame.svg" mode="widthFix"></image>
						</span>
					</ModalRecharge>
				</view>
			</view>

			<view class="user-action">
				<view class="card">
					<navigator url="/pages/print/orders">
						<view class="user-action-content">
							<image class="icon" src="/static/print.svg" mode="widthFix"></image>
							<view class="text">
								打印订单
							</view>
						</view>
					</navigator>
				</view>
				<view class="card">
					<navigator url="/pages/user/photoOrder">
						<view class="user-action-content">
							<image class="icon" src="/static/order.svg" mode="widthFix"></image>
							<view class="text">
								生图订单
							</view>
						</view>
					</navigator>
				</view>
			</view>

			<view class="user-view">
				<navigator url="/pages/distributor/index">
					<view class="card">
						<image class="icon" src="/static/chat.svg" mode="widthFix"></image>
						分销信息
					</view>
				</navigator>
				<navigator url="/pages/user/settings">
					<view class="card">
						<image class="icon" src="/static/settings.svg" mode="widthFix"></image>
						账号设置
					</view>
				</navigator>
				<button open-type="contact" class="clean-button">
					<view class="card">
						<image class="icon" src="/static/kf.svg" mode="widthFix"></image>
						在线客服
					</view>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import Header from '@/components/Header.vue'
import ModalRecharge from '@/components/ModalRecharge.vue'
import DistributionQRcode from '@/components/DistributionQRcode.vue'
import { getLocalToken, getCode } from '@/utils/user'
import apiUser from '@/api/user'
export default {
	async onShareAppMessage() {
		const imageUrl = await getCode()
		return {
			title: 'LaLaMan',
			path: `/pages/index/index?from=share&pid=${this.userInfo.id}`,
			imageUrl
		}
	},
	components: {
		Header,
		ModalRecharge,
		DistributionQRcode
	},
	data() {
		return {
			statusBarHeight: uni.$statusBarHeight,
			currentSize: 1,
			userInfo: {}
		};
	},
	onLoad() {
		// const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		// this.menuInfo = menuButtonInfo
	},
	onShow() {
		this.requestUserInfo()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		changeCurrentSize(size) {
			this.currentSize = size
		},
		async requestUserInfo() {
			const userRes = await apiUser.getUserInfo()
			this.userInfo = userRes.data
		}
	}
}
</script>

<style lang="less" scoped>
.user-container {
	.user-content {
		margin: 0 30rpx;

		.distribution-wrapper {
			position: relative;
			z-index: 2;
			margin: 12rpx 0 -62rpx auto;
			width: fit-content;

			.distribution {
				width: 70rpx;
				right: 0;
				top: 0;
			}
		}

		.user-info-wrapper {
			background: url(/static/box-bg.png) no-repeat transparent;
			background-size: 100% 100%;
		}

		.user-info {
			display: flex;
			gap: 20rpx;
			color: #010101;

			&-vector {
				width: 122rpx;
				height: 122rpx;
				border-radius: 50%;
			}

			&-message {

				&-nickname {
					font-size: 36rpx;
					font-weight: bold;
					display: flex;
					align-items: center;
					gap: 20rpx;

					.icon-edit {
						width: 32rpx;
					}
				}

				&-tel {
					font-size: 28rpx;
					margin-top: 12rpx;
				}
			}
		}

		.addition-info {
			margin-top: 32rpx;
			font-size: 24rpx;
			display: flex;
			align-items: center;
			gap: 6rpx;

			&-second {
				color: #666666;
			}

			&-count {
				font-weight: bold;
				font-size: 28rpx;
			}

			&-pay {
				display: flex;
				align-items: center;
				gap: 6rpx;

				.icon {
					width: 20rpx;
				}
			}
		}

		.user-action {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 26rpx;
			margin-top: 20rpx;

			.card {
				flex: 1;
				padding: 0;
			}

			&-content {
				text-align: center;
				padding: 30rpx 0;

				.icon {
					width: 60rpx;
				}

				.text {
					font-size: 24rpx;
					font-weight: bold;
					margin-top: 12rpx;
				}
			}
		}

		.user-view {
			.card {
				margin-top: 20rpx;
				display: flex;
				gap: 20rpx;
				background: url(/static/frame.svg) right 40rpx center no-repeat #fff;

				.icon {
					width: 44rpx;
				}
			}
		}
	}
}
</style>
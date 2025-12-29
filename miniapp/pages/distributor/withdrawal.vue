<template>
	<Header>申请提现</Header>
	<view class="card info circle c">
		<view class="info-top">
			<view class="info-top-left">
				<view class="label">
					可提现金额（元）
				</view>
				<view class="amount">
					<label class="amount-symbol">¥</label>{{ userInfo?.balance || '0.00' }}<label
						class="amount-freeze">冻结金额：{{ userInfo?.balance_freeze || '0.00' }}元</label>
				</view>
			</view>
		</view>
		<view class="set">

		</view>
	</view>
	<view class="withdrawal-wrapper">
		<view class="c">
			<view class="label">
				本次提现金额（元）
			</view>
			<view>
				<input type="text" class="amount" v-model="amount" @input="onAmountInput" />
			</view>
			<view class="channel">
				<view class="channel-left">
					提现至微信
				</view>
				<view class="channel-right">
					<text>{{ userInfo?.showTel }}</text>
				</view>
			</view>
		</view>
		<view class="c btn-wrapper">
			<button class="btn-3" @click="onWithdrawal()">确认提现</button>
			<navigator url="/pages/user/agreement?type=withdrawal_instruction">
				<view class="desc">
					提现说明
				</view>
			</navigator>
		</view>
	</view>
</template>

<script>
import Header from '@/components/Header.vue'
import apiDistributor from '@/api/distributor'

import apiUser from '@/api/user'
export default {
	components: {
		Header,
	},
	data() {
		return {
			userInfo: {},
			amount: 0
		};
	},
	async onLoad() {
		this.onGetUserInfo()
	},
	methods: {
		// 获取用户提现信息
		async onGetUserInfo() {
			const res = await apiUser.getUserInfo()
			const _userInfo = res.data
			this.userInfo = {
				..._userInfo,
				showTel: this.maskPhone(_userInfo.tel || '')
			}
			this.amount = this.userInfo.balance
		},
		onWithdrawal() {
			const _this = this
			if (Number(this.amount) < 0.01) {
				uni.showToast({ title: '提现金额不能小于0.01元', icon: 'none' })
				return
			}
			apiDistributor.onWithdraw({
				amount: this.amount,
				wx_id: this.userInfo.tel
			}).then(res => {
				uni.showModal({
					title: '提现信息',
					content: res.message,
					showCancel: false,
					complete: () => {
						_this.onGetUserInfo()
						// 调用
					}
				})
			})
		},
		maskPhone(tel) {
			const str = String(tel || '');
			return str.slice(0, 3) + '***' + str.slice(6);
		},
		onAmountInput(e) {
			const MAX_VALUE = this.userInfo.balance
			let val = Number(e.detail.value)
			if (val > MAX_VALUE) {
				val = MAX_VALUE
				uni.showToast({ title: `最大不能超过 ${MAX_VALUE}`, icon: 'none' })
			}
			this.amount = val
		}
	}
}
</script>

<style lang="less" scoped>
.info {
	.set {
		height: 100rpx;
	}

	&-top {
		display: flex;
		justify-content: space-between;
		position: relative;
		z-index: 2;

		&-left {
			font-weight: 500;

			.label {
				color: #65667D;
				font-size: 24rpx;
			}

			.amount {
				font-size: 48rpx;
				margin-top: 50rpx;

				&-symbol {
					font-size: 24rpx;
				}

				&-freeze {
					font-size: 24rpx;
					margin-left: 12rpx;
				}
			}

			.count {
				margin-top: 44rpx;
				font-size: 24rpx;
			}
		}

		&-right {
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.btn {
				width: 136rpx;
				height: 56rpx;
				line-height: 56rpx;
				background: #010101;
				border-radius: 8rpx 8rpx 8rpx 8rpx;
				color: #fff;
				text-align: center;
				font-size: 24rpx;
				padding: 0;
			}

			.record {
				background: url(/static/frame.svg) right center no-repeat;
				box-sizing: 28rpx;
				padding-right: 36rpx;
			}
		}
	}
}

.withdrawal-wrapper {
	background-color: #fff;
	margin-top: 20rpx;
	padding-top: 52rpx;
	height: calc(100vh - 614rpx);

	.label {
		color: #65667D;
	}

	.amount {
		border: 2rpx solid #EEEEEE;
		height: 108rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		padding: 0 40rpx;
		margin-top: 16rpx;
		border-radius: 8rpx;
		font-size: 48rpx;
		font-weight: bold;
	}

	.channel {
		display: flex;
		justify-content: space-between;
		font-weight: 500;
		margin-top: 4rpx;

		&-left {
			color: #65667D;
		}
	}

	.btn-wrapper {
		margin-top: 160rpx;
	}

	.desc {
		margin-top: 40rpx;
		color: #65667D;
		text-align: center;
	}
}
</style>
<template>
	<Header>我的充值</Header>
	<view class="c">
		<view class="card info">
			<view class="info-top">
				<view class="info-top-left">
					<view class="label">
						剩余次数
					</view>
					<view class="amount">
						{{ rechargeInfo.num_balance }}
					</view>
					<view class="count">
						累计购买次数：{{ rechargeInfo.orders_count }}次
					</view>
				</view>
				<view class="info-top-right">
					<navigator url="/pages/user/photoOrder">
						<button class="btn">生图订单</button>
					</navigator>
					<navigator url="/pages/user/rechargeRecord">
						<view class="record">
							充值记录
						</view>
					</navigator>
				</view>
			</view>
		</view>
	</view>
	<view class="recharge-wrapper">
		<Recharge :className="'my'" :callbacks="callbacks" />
	</view>
</template>

<script>
import Header from '@/components/Header.vue'
import Recharge from '@/components/Recharge.vue'
import apiUser from '@/api/user'
export default {
	components: {
		Header,
		Recharge
	},
	data() {
		return {
			rechargeInfo: {},
			callbacks: {
				onSuccess: () => {
					this.reqRecahrgeInfo();
				}
			}
		};
	},
	onLoad() {
		this.reqRecahrgeInfo();
	},
	methods: {
		reqRecahrgeInfo() {
			apiUser.getRechargeInfo().then(res => {
				this.rechargeInfo = res.data;
			});
		}
	}
}
</script>

<style lang="less" scoped>
.info {
	position: relative;
	overflow: hidden;
	margin-top: 30rpx;

	&::before,
	&::after {
		content: '';
		position: absolute;
		width: 278rpx;
		height: 278rpx;
		border-radius: 278rpx;
		background: linear-gradient(180deg, #000000 0%, #FFFFFF 100%);
		opacity: 0.08;
		z-index: 1;
	}

	&::before {
		left: 0;
		top: 0;
		transform: translate(-50%, -50%);
	}

	&::after {
		right: 0;
		bottom: 0;
		transform: translate(50%, 50%);
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

.recharge-wrapper {
	background-color: #fff;
	margin-top: 20rpx;
	padding: 0 30rpx;
}
</style>
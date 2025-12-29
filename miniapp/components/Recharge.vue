<template>
	<view :class="['recharge', className]">
		<view class="list-wrapper">
			<view class="no-service-product" v-if="serviceProductList.length === 0">
				暂无充值产品 ~
			</view>
			<view v-for="(item, index) in serviceProductList" class="list"
				:class="{ 'active': index === checkedIndex, 'margin-tip': item.tip.trim() !== '' }" :key="index"
				@click="handleCheckProduct(index)">
				<view class="list-tag" v-if="item.tip.trim() !== ''">
					{{ item?.tip }}
				</view>
				<view class="left">
					<view class="left-1">
						{{ item.title }}
					</view>
					<view class="left-2">
						{{ item.desc }}
					</view>
				</view>
				<view class="right">
					<view class="right-1">
						￥{{ item.show_price }}
					</view>
					<view class="right-2">
						<label for="">￥</label>{{ item.price }}
					</view>
				</view>
			</view>

		</view>
		<view class="t-1" v-if="Number(balanceInfo?.max_balance_amount) > 0">
			<view class="t-1-1">
				<label style="display: flex;align-items: center;" @click="balanceDeduct = !balanceDeduct">
					<checkbox :checked="balanceDeduct" style="transform:scale(0.8)" color="#010101" />佣金抵扣
				</label>
			</view>
			<view class="t-1-2">
				-￥{{ balanceInfo?.max_balance_amount }}
			</view>
		</view>
		<view class="t-2">
			<label>请阅读</label>
			<navigator url="/pages/user/agreement?type=payment_agreement">《支付服务条款》</navigator>
		</view>
	</view>
	<view class="bottom-btn-wrapper-fixed">
		<button class="btn-3" @click="handleCreate">确认协议并支付</button>
	</view>
</template>

<script>
import _ from 'lodash'
import apiRecharge from '@/api/recharge'
import apiUser from '@/api/user'
import { createAndPayOrder, calculateMaxDiscountAmount } from '@/utils/recharge'

export default {
	name: "Recharge",
	props: {
		className: {
			type: String,
			default: ''
		},
		callbacks: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			serviceProductList: [],
			checkedIndex: -1,
			open: false,
			userInfo: {},
			balanceDeduct: true,
			balanceInfo: {}
		};
	},
	mounted() {
		this.reqUserInfo()
		this.requestServiceProductList()
	},
	methods: {
		async requestServiceProductList() {
			const res = await apiRecharge.serviceProductList()
			this.serviceProductList = res?.data?.data || []
			this.handleCheckProduct(0)
		},
		async reqUserInfo() {
			apiUser.getUserInfo().then(res => {
				this.userInfo = res?.data || {}
			})
		},
		handleCheckProduct(index) {
			this.checkedIndex = index
		},
		handleSwitch(state) {
			this.open = state
		},
		handleCreate() {
			const {
				price,
				id,
				count
			} = this.serviceProductList?.[this.checkedIndex] || {}
			const {
				balance = 0
			} = this.userInfo
			const params = {
				"order_type": 1, //订单类型 1充值订单 2打印订单 
				"total_amount": price, //总金额 
				"payment_amount": Number(price) - (this.balanceInfo?.balance_amount || 0), //支付金额 
				"balance_amount": this.balanceInfo?.balance_amount || 0, //佣金抵扣
				service_product_id: id,
				order_count: count,
				// order_type=1必传 --------
				"product_id": 0, //order type:1 的情况下 product_id: 为0
				"product_spec_id": '', //产品规格id 
				"num": '', //购买数量 
				"photo_order_id": '', //生图订单id 
				"address_id": '' //地址id 
			}
			createAndPayOrder(params, this.callbacks)
		},
		handleWatchedChange() {
			const balance = this.userInfo?.balance
			if (balance === undefined || balance === null) return // balance 不存在就中止
			const params = {
				user_balance: balance,
				balanceDeduct: this.balanceDeduct,
				price_adjustment: this.serviceProductList?.[this.checkedIndex]?.price ?? 0
			}
			this.balanceInfo = calculateMaxDiscountAmount(params)
		}
	},
	watch: {
		checkedIndex: 'handleWatchedChange',
		balanceDeduct: 'handleWatchedChange',
		userInfo: {
			handler: 'handleWatchedChange',
			deep: true
		}
	}
}
</script>

<style lang="less">
.recharge {
	padding-top: 60rpx;

	.list-wrapper {
		padding-top: 20rpx;
		box-sizing: border-box;
	}

	&.my {
		.list-wrapper {
			height: calc(100vh - 850rpx - 47px);
			overflow-y: auto;
		}
	}

	&.modal {
		padding-top: 30rpx;
		padding-bottom: 200rpx;

		.list-wrapper {
			max-height: 800rpx;
			overflow-y: auto;

			.list {
				margin-left: 0;
				margin-right: 0;
			}
		}
	}

	.no-service-product {
		color: #C9C9C9;
		padding: 24rpx 0;
		text-align: center;
	}

	.list {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 148rpx;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		border: 2rpx solid #010101;
		box-sizing: border-box;
		margin: 20rpx auto auto;
		padding: 0 30rpx;
		position: relative;

		&.margin-tip {
			margin-top: 48rpx;
		}

		&:first-child {
			margin-top: 0;
		}

		&-tag {
			min-width: 156rpx;
			height: 48rpx;
			line-height: 48rpx;
			padding: 0 20rpx;
			background-size: cover;
			text-align: center;
			position: absolute;
			left: -2px;
			top: -24rpx;
			color: #000;
			font-weight: 500;
			font-size: 24rpx;
			// 左上角 #FFCB59 到右下角 #8E6714渐变
			background: linear-gradient(to bottom right, #FFCB59, #8E6714);
			border-radius: 28rpx 0 28rpx 0;
			box-sizing: border-box;
		}

		&.active {
			background-color: #010101;
			color: #fff;
		}

		.left {
			display: flex;
			align-items: baseline;
			gap: 8rpx;

			&-1 {
				font-size: 36rpx;
				font-weight: bold;
			}

			&-2 {
				font-size: 500;
			}
		}

		.right {
			display: flex;
			align-items: baseline;
			gap: 20rpx;

			&-1 {
				color: #C9C9C9;
				text-decoration: line-through;
			}

			&-2 {
				font-size: 44rpx;
				font-size: 500;

				label {
					font-size: 24rpx;
				}
			}
		}
	}

	.t-1 {
		display: flex;
		justify-content: space-between;
		margin-top: 32rpx;

		&-1 {
			display: flex;
			align-items: center;
			gap: 12rpx;

			.checkbox {
				width: 28rpx;
				height: 28rpx;
				border-radius: 3rpx;
				border: 1px solid #C9C9C9;
				box-sizing: border-box;
			}
		}

		&-2 {
			color: #FA3E3E;
		}
	}

	.t-2 {
		margin-top: 32rpx;
		display: flex;
		align-items: center;

		label {
			color: #C9C9C9;
		}
	}
}
</style>
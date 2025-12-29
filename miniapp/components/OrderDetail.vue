<template>
	<view @click="onParentAction({ action: 'order-detail', record })" v-if="record">
		<Card :title="`${displayRange.includes(0) ? `订单时间：${record?.create_time}` : ''}`">
			<template #extra>
				<view :class="`status status-${record?.order_status}`">
					{{ record?.order_status_desc }}
				</view>
			</template>
			<view class="order-list" :class="[className]">
				<view class="order-list-item">
					<template v-if="displayRange.includes(1)">
						<view class="t-2">
							<view class="t-2-1">
								<image class="t-2-1-1" :src="record?.product_image" mode="aspectFit"></image>
								<view class="t-2-1-2">
									{{ record?.product_name }}<br />{{ record?.spec }}
								</view>
							</view>
							<view class="t-2-2">
								<view class="t-2-2-1">¥{{ record?.total_price }}</view>
								<view class="t-2-2-2">x {{ record?.num }}</view>
							</view>
						</view>
					</template>

					<template v-if="displayRange.includes(2)">
						<view>
							<view class="t-3">
								<view class="t-3-1">打印照片</view>
								<image class="t-3-2" :src="getThumbnailUrl(record?.result_image, 80)" mode="aspectFit">
								</image>
							</view>
							<view class="t-4">
								<view class="t-4-1" v-if="record?.view_refund === true">
									退款金额 <label>￥{{ record?.refund_amount || '0.00' }}</label>
								</view>
								<view class="t-4-1" v-else>
									实付款 <label>￥{{ record?.payment_amount }}</label>
								</view>
							</view>
						</view>
					</template>

					<template v-if="displayRange.includes(3)">
						<view class="t-5">
							<view class="t-5-1">
								<button class="btn-2" v-if="record?.show_button?.agree_refund === true"
									@click.stop="onParentAction({ action: 'apply-sales-detail', record })">退款成功</button>
								<button class="btn-2" v-if="record?.show_button?.cancel_pay === true"
									@click.stop="handleCancelOrder()">取消订单</button>
								<button class="btn-2" v-if="record?.show_button?.apply_refund === true"
									@click.stop="onParentAction({ action: 'apply-sales', record })">申请售后</button>
								<button class="btn-2" v-if="record?.show_button?.delete_order === true"
									@click.stop="handleDeleteOrder()">删除订单</button>
								<button class="btn-2" v-if="record?.show_button?.examine_refund === true"
									@click.stop="onParentAction({ action: 'apply-sales-detail', record })">待商家审核</button>
								<button class="btn-2" v-if="record?.show_button?.refuse_refund === true"
									@click.stop="onParentAction({ action: 'apply-sales-detail', record })">申请拒绝</button>
								<button class="btn-3" v-if="record?.show_button?.view_logistics === true"
									@click.stop="onParentAction({ action: 'logistics', record })">查看物流</button>
								<button class="btn-3" v-if="record?.show_button?.confirm_receipt === true"
									@click.stop="handleConfirmReceipt()">确认收货</button>
								<button class="btn-3" v-if="record?.show_button?.cancel_pay === true"
									@click.stop="handleRePayNow()">立即支付</button>
							</view>
						</view>
					</template>

					<template v-if="displayRange.includes(4)">
						<view class="t-2">
							<view class="t-2-1">申请退款金额</view>
							<view class="">
								￥{{ record?.refund_amount }}
							</view>
						</view>
						<view class="t-2" style="align-items: flex-start;">
							<view class="t-2-1">退款原因</view>
							<view style="color: #999999;width: 462rpx;">
								{{ record?.reason }}
							</view>
						</view>
						<view class="t-2">
							<view class="t-2-1">退款凭证</view>
							<view class="t-2-image">
								<image v-for="item in (record?.file || [])" :src="getThumbnailUrl(item, 80)" mode="aspectFill"></image>
							</view>
						</view>
						<view class="t-2">
							<view class="t-2-1">申请时间</view>
							<view style="color: #999999;">
								{{ record?.refund_time }}
							</view>
						</view>
					</template>
				</view>
			</view>
		</Card>
	</view>
</template>

<script>
import Card from '@/components/Card.vue'
import {
	handlePayNow
} from '@/utils/recharge'
import apiRecharge from '@/api/recharge'
import { getThumbnailUrl } from '@/utils/base'
export default {
	name: 'OrderDetail',
	components: {
		Card,
	},
	props: {
		record: {
			type: Object,
			required: true
		},
		displayRange: {
			type: Array,
			default: () => []
		},
		className: {
			type: String,
			default: ''
		},
		// 不允许点击动作，比如‘order-detail’怎不允许点击查看详情
		notAllowAction: {
			type: Array,
			default: []
		},
	},
	data() {
		return {
		}
	},
	watch: {
		record: {
			handler(newVal) {
				// this.record = newVal
			},
			deep: true
		},
	},
	computed: {
		// record: {
		// 	get() {
		// 		return this.$props.record
		// 	},
		// 	set(val) {
		// 		this.$emit('update:record', val)
		// 	}
		// }
	},
	methods: {
		getThumbnailUrl,
		onParentAction(action) {
			this.$emit('onAction', action)
		},
		onTabClick(index) {
			this.$emit('change', index)
		},
		handleRePayNow() {
			handlePayNow(this.record?.id, {
				onSuccess: () => {
					this.$emit('refresh')
				},
				onFail: () => {
					uni.showToast({
						title: '支付失败',
						icon: 'none'
					})
				},
				onCancel: () => {
					uni.showToast({
						title: '取消支付',
						icon: 'none'
					})
				}
			});
		},
		// 确认收货
		handleConfirmReceipt() {
			uni.showModal({
				title: '确认收货',
				content: '请确认是否收到货？',
				success: (res) => {
					if (res.confirm) {
						apiRecharge.confirmReceipt(this.record?.id).then(res => {
							uni.showToast({
								title: '确认收货成功',
								icon: 'success'
							})
							this.$emit('refresh')
						})
					}
				}
			})
		},
		// 取消订单
		handleCancelOrder() {
			uni.showModal({
				title: '取消订单',
				content: '请确认是否取消订单？',
				success: (res) => {
					if (res.confirm) {
						apiRecharge.cancelOrder(this.record?.id).then(res => {
							uni.showToast({
								title: '取消订单成功',
								icon: 'success'
							})
							this.$emit('refresh')
						})
					}
				}
			})
		},
		// 删除订单
		handleDeleteOrder() {
			uni.showModal({
				title: '删除订单',
				content: '请确认是否删除订单？',
				success: (res) => {
					if (res.confirm) {
						apiRecharge.deleteOrder(this.record?.id).then(res => {
							uni.showToast({
								title: '删除订单成功',
								icon: 'success'
							})
							this.$emit('refresh')
						})
					}
				}
			})
		},
		onPaySuccess() {
			this.$emit('refresh')
		}
	}
}
</script>

<style lang="less" scoped>
.order-list {
	&-item {
		padding: 0;
		margin-top: 20rpx;

		&:first-child {
			margin-top: 0;
		}

		.t-2 {
			box-sizing: border-box;
			display: flex;
			justify-content: space-between;
			padding: 30rpx 0;

			&-1 {
				display: flex;
				align-items: center;
				gap: 20rpx;

				&-1 {
					width: 160rpx;
					height: 160rpx;
					background-color: #EEEEEE;
				}

				&-2 {
					font-size: 28rpx;
					font-weight: bold;
					line-height: 1.6;
				}
			}

			&-2 {
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-direction: column;
				font-size: 28rpx;

				&-1 {
					font-weight: bold;
				}

				&-2 {
					color: #65667D;
					text-align: right;
					width: 100%;
				}
			}

			&-image {
				display: flex;
				justify-content: flex-end;
				gap: 20rpx;

				image {
					width: 80rpx;
					height: 80rpx;
				}
			}
		}

		.t-3 {
			border-top: 1px solid #EEEEEE;
			border-bottom: 1px solid #EEEEEE;
			box-sizing: border-box;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 0;

			&-1 {
				font-weight: 500;
			}

			&-2 {
				width: 120rpx;
				height: 90rpx;
				background-color: #EEEEEE;
			}
		}

		.t-4 {
			display: flex;
			justify-content: flex-end;
			padding: 36rpx 0 0;

			&-1 {
				label {
					font-size: 36rpx;
					font-weight: bold;
					margin-left: 16rpx;
					color: #FA3E3E;
				}
			}
		}

		.t-5 {
			display: flex;
			justify-content: flex-end;
			margin-top: 36rpx;

			&-1 {
				display: flex;
				gap: 20rpx;

				.btn-2,
				.btn-3 {
					width: 196rpx;
					height: 76rpx;
					line-height: 72rpx;
				}
			}
		}
	}

	.btn-2,
	.btn-3 {
		font-weight: normal;
		padding: 0;
	}

	&.order-detail {
		.t-5 {
			position: fixed;
			inset: 0;
			top: auto;
			height: 202rpx;
			background-color: #fff;
			display: flex;
			justify-content: flex-end;
			gap: 20rpx;
			padding: 28rpx 30px 0;
			box-sizing: border-box;

			.btn-2,
			.btn-3 {
				width: 200rpx;
				height: 80rpx;
				line-height: 76rpx;
				margin: 0;
			}
		}
	}
}

.status {
	font-weight: bold;
}

.status-1 {
	color: #FA3E3E;
}

.status-2 {
	color: #999;
}
</style>
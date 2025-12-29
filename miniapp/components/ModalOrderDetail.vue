<template>
	<Popup :visible="visible" :closeOnMaskClick="true">
		<view class="order-detail-modal" v-if="visible">
			<Header :back="handleClose">订单详情</Header>
			<view class="c" style="margin-top: 20rpx;">
				<OrderDetail :record="order" :displayRange="[1, 2, 3]" @onAction="handleAction"
					className="order-detail" />
				<Card class="card-take-contaniner" title="订单详情">
					<view class="t-2">
						<view class="t-2-1">
							收货信息
						</view>
						<view class="t-2-2">
							{{ order?.address }}
						</view>
					</view>
					<view class="t-2">
						<view class="t-2-1">
							订单编号
						</view>
						<view class="t-2-2">
							{{ order?.order_no }}
						</view>
					</view>
					<view class="t-2">
						<view class="t-2-1">
							支付时间
						</view>
						<view class="t-2-2">
							{{ order?.payment_time }}
						</view>
					</view>
					<view class="t-2">
						<view class="t-2-1">
							确认收货时间
						</view>
						<view class="t-2-2">
							{{ order?.after_time }}
						</view>
					</view>
				</Card>
			</view>
		</view>
	</Popup>
</template>

<script>
import Popup from '@/components/Popup.vue'
import Header from '@/components/Header.vue'
import OrderDetail from '@/components/OrderDetail.vue';
import Card from '@/components/Card.vue';
export default {
	name: 'ModalOrderDetail',
	components: {
		Popup,
		Header,
		OrderDetail,
		Card
	},
	props: {
		order: {
			type: Object,
			default: () => { }
		},
		visible: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			order: this.order
		};
	},
	methods: {
		handleClose() {
			this.$emit('close');
		},
		handleAction({ action, record }) {
			this.$emit('onAction', { action, record });
		}
	},
	watch: {
		order: {
			deep: true,
			handler(newVal, oldVal) {
				this.order = newVal;
			}
		}
	}
}
</script>

<style lang="less" scoped>
.order-detail-modal {
	height: 100vh;
	background-color: #F8F8F8;
}

.card-take-contaniner {
	margin: 20rpx 30rpx auto;
	padding: 0;

	.t-2 {
		display: flex;
		justify-content: space-between;
		margin: 30rpx;
		line-height: 1.6;

		&-1 {
			text-align: left;
		}

		&-2 {
			width: 402rpx;
			text-align: right;
			color: #65667D;
		}
	}
}
</style>
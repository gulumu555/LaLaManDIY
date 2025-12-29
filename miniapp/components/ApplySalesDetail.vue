<template>
	<Popup :visible="visible" :closeOnMaskClick="true">
		<view class="apply-sales-detail" v-if="visible">
			<Header :back="handleClose">售后详情</Header>
			<view class="c" style="margin-top: 20rpx;">
				<view class="progress">
					<view class="progress-title">
						{{ info?.examine_status_desc }}
						<view class="reason" v-if="info?.examine_status === 3">拒绝原因：{{ info?.remark }}</view>
					</view>
					<view class="progress-info" :class="['step-' + info?.examine_status]">
						<view class="progress-info-item progress-info-item1">
							<view class="icon">

							</view>
							<view class="des">
								提交申请
							</view>
						</view>
						<view class="progress-info-item progress-info-item2">
							<view class="icon">

							</view>
							<view class="des">
								商家审核
							</view>
						</view>
						<view class="progress-info-item progress-info-item3">
							<view class="icon">

							</view>
							<view class="des">
								退款成功
							</view>
						</view>
					</view>
				</view>
				<OrderDetail :record="order" :displayRange="[1, 4]" :notAllowAction="['order-detail']" />
				<Card class="list" :styles="{ marginTop: '20rpx' }">
					<view class="list-item">
						<view class="list-item-left">
							实付款
						</view>
						<view class="list-item-right">
							¥{{ info?.payment_amount || '0.00' }}
						</view>
					</view>
					<view class="list-item" style="margin-top: 24rpx;" v-if="Number(info?.balance_amount) > 0">
						<view class="list-item-left">
							佣金抵扣
						</view>
						<view class="list-item-right">
							¥{{ info?.balance_amount || '0.00' }}
						</view>
					</view>
					<!-- 退款成功 -->
					<template v-if="info.examine_status === 2">
						<view class="list-item" style="margin-top: 24rpx;" v-if="Number(info?.wx_amount) > 0">
							<view class="list-item-left">
								微信原路退回
							</view>
							<view class="list-item-right">
								¥{{ info?.wx_amount || '0.00' }}
							</view>
						</view>
						<view class="list-item" style="margin-top: 24rpx;" v-if="Number(info?.balance_amount) > 0">
							<view class="list-item-left">
								佣金退回
							</view>
							<view class="list-item-right">
								¥{{ info?.balance_amount || '0.00' }}
							</view>
						</view>
					</template>
				</Card>
			</view>
		</view>
		<view class="bottom-btn-wrapper-fixed">
			<button class="btn-3" v-if="info?.examine_status === 1" @click="handleCancelAfterSale">撤销售后申请</button>
			<button class="btn-3" v-if="info?.examine_status === 3" @click="handleApplyAfterSale">重新申请售后</button>
		</view>
	</Popup>
</template>

<script>
// 1 3 代表 前端的商家审核  1是审核中 3是审核拒绝 
// 2退款成功
import Popup from '@/components/Popup.vue'
import Header from '@/components/Header.vue'
import OrderDetail from '@/components/OrderDetail.vue';
import Card from '@/components/Card.vue';
import apiRecharge from '@/api/recharge';
export default {
	name: 'ApplySalesDetail',
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
			info: {},
		};
	},
	methods: {
		handleClose() {
			this.$emit('close');
		},
		// 获取售后详情
		getSalesDetail() {
			apiRecharge.afterSaleDetail(this.order?.id).then(res => {
				this.info = res.data;
			})
		},
		handleCancelAfterSale() {
			uni.showModal({
				title: '提示',
				content: '确定撤销售后申请？',
				showCancel: true,
				success: ({ confirm, cancel }) => {
					if (confirm) {
						apiRecharge.cancelAfterSale(this.order?.id).then(res => {
							uni.showToast({
								title: '撤销成功',
								icon: 'success',
								complete: () => {
									this.$emit('close');
									this.$emit('refresh');
								}
							});
						})
					}
				}
			})
		},
		handleApplyAfterSale() {
			this.$emit('onApplyAfterSales');
		}
	},
	watch: {
		visible(newVal) {
			if (newVal) {
				this.getSalesDetail();
			}
		},
		order(newVal) {
			if (newVal) {
				this.getSalesDetail();
			}
		}
	}
}
</script>

<style lang="less" scoped>
.apply-sales-detail {
	height: 100vh;
	background-color: #F8F8F8;
}

.progress {
	margin: 22rpx 30rpx 56rpx;

	&-title {
		font-weight: bold;

		.reason {
			color: #FA3E3E;
			margin-top: 20rpx;
		}
	}

	&-info {
		display: flex;
		justify-content: space-between;
		flex: 1;
		margin: 38rpx 64rpx auto;
		position: relative;

		&::before,
		&::after {
			content: '';
			height: 2rpx;
			background: #C6C6C6;
			position: absolute;
			top: 21rpx;
			z-index: 1;
		}

		&::before {
			left: 4ex;
			right: 50%;
		}

		&::after {
			left: 50%;
			right: 4ex;
		}

		&-item {
			text-align: center;
			position: relative;
			z-index: 2;

			.icon {
				width: 40rpx;
				height: 40rpx;
				border-radius: 40rpx;
				background-color: #fff;
				box-sizing: border-box;
				border: 2rpx solid #C6C6C6;
				margin: 0 auto;
			}

			.des {
				font-size: 24rpx;
				color: #6F6F6F;
				margin-top: 20rpx;
			}
		}

		&.step-1 {

			.progress-info-item1 {
				.icon {
					background: url(/static/complete.svg);
					background-size: 100%;
					border: none;
				}
			}

			&::before {
				background-color: #010101;
			}
		}

		&.step-2 {

			.progress-info-item1,
			.progress-info-item2,
			.progress-info-item3 {
				.icon {
					background: url(/static/complete.svg);
					background-size: 100%;
					border: none;
				}
			}

			&::before {
				background-color: #010101;
			}
		}

		&.step-3 {
			.progress-info-item1 {
				.icon {
					background: url(/static/complete.svg);
					background-size: 100%;
					border: none;
				}
			}

			.progress-info-item2 {
				.icon {
					background: url(/static/error.svg);
					background-size: 100%;
					border: none;
				}
			}

			&::before {
				background-color: #010101;
			}
		}
	}
}

.list {
	margin-top: 20rpx;

	&-item {
		display: flex;
		justify-content: space-between;
		font-weight: 500;

		&-left {}

		&-right {
			color: #65667D;
		}
	}
}
</style>
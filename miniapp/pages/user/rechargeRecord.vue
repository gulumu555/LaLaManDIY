<template>
	<Header>充值记录</Header>
	<InfiniteList :fetchFn="reqDatalist" ref="infiniteList" :styles="{ height: 'calc(100vh - 47px - 78rpx)' }">
		<template #default="{ item }">
			<Card :styles="{ margin: '20rpx 30rpx auto' }">
				<view class="list">
					<view class="list-label">购买产品：</view>
					<view class="list-value">{{ item?.order_count }}次</view>
				</view>
				<view class="list">
					<view class="list-label">订单金额：</view>
					<view class="list-value">￥{{ item?.total_amount }}</view>
				</view>
				<view class="list" v-if="Number(item?.balance_amount) > 0">
					<view class="list-label">佣金抵扣：</view>
					<view class="list-value">￥{{ item?.balance_amount }}</view>
				</view>
				<view class="list">
					<view class="list-label">微信支付：</view>
					<view class="list-value">￥{{ item?.payment_amount }}</view>
				</view>
				<view class="list">
					<view class="list-label">交易单号：</view>
					<view class="list-value">{{ item?.order_no }}</view>
				</view>
				<view class="list">
					<view class="list-label">订单时间：</view>
					<view class="list-value">{{ item?.create_time }}</view>
				</view>
				<view class="list">
					<view class="list-label">订单状态：</view>
					<view class="list-value">{{ paymentStatus?.[item?.payment_status] }}</view>
				</view>
				<template v-if="item?.payment_status === 0">
					<view class="list list-btn">
						<button class="btn-2" @click="handleCancelOrder(item?.id)">取消订单</button>
						<button class="btn-3" v-if="!(item.payment_status === 0 && item.remainSeconds <= 0)"
							@click="handleRePayNow(item?.id)">立即付款</button>
					</view>
					<view class="list list-time" v-if="item.payment_status === 0 && item.remainSeconds > 0">
						剩余支付时间<label>{{ formatRemain(item.remainSeconds) }}</label>
					</view>
					<view class="list list-time" v-else-if="item.payment_status === 0 && item.remainSeconds <= 0">
						<label>已过期</label>
					</view>
				</template>
			</Card>
		</template>
	</InfiniteList>
</template>
<script>
import Header from '@/components/Header.vue'
import Card from '@/components/Card.vue'
import InfiniteList from '@/components/InfiniteList.vue'
import apiUser from '@/api/user'
import { handlePayNow } from '@/utils/recharge'

export default {
	components: {
		Header,
		InfiniteList,
		Card
	},
	data() {
		return {
			paymentStatus: { 0: '待支付', 1: '已支付', 2: '已取消', 3: '申请退款', 4: '已退款', 5: '退款失败' },
			timer: null,
			list: []
		};
	},
	onLoad() {
	},
	methods: {
		async reqDatalist(params) {
			const res = await apiUser.getRechargeRecord(params);
			const list = res.data?.data || [];
			list.forEach(item => {
				if (item.payment_status === 0) {
					const endTime = new Date(item.create_time).getTime() + 30 * 60 * 1000;
					item.remainSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
				}
			});
			this.list = list;
			this.startTimer();
			return res;
		},
		async handleCancelOrder(order_no) {
			uni.showModal({
				title: '提示',
				content: '确定取消订单吗？',
				success: (res) => {
					if (res.confirm) {
						apiUser.cancelRechargeOrder(order_no).then(() => {
							uni.showToast({ title: '取消成功', icon: 'success' })
							this.$refs.infiniteList.refresh()
						}).catch(() => {
							uni.showToast({ title: '取消失败', icon: 'none' })
						})
					}
				}
			})
		},
		startTimer() {
			if (this.timer) clearInterval(this.timer);
			this.timer = setInterval(() => {
				let hasUnpaid = false;
				this.list.forEach(item => {
					if (item.payment_status === 0 && item.remainSeconds > 0) {
						item.remainSeconds--;
						hasUnpaid = true;
					}
				});
				if (!hasUnpaid) {
					clearInterval(this.timer);
					this.timer = null;
				}
			}, 1000);
		},
		formatRemain(seconds) {
			const m = String(Math.floor(seconds / 60)).padStart(2, '0');
			const s = String(seconds % 60).padStart(2, '0');
			return `${m}分${s}秒`;
		},
		handleRePayNow(order_no) {
			handlePayNow(order_no, {
				onSuccess: () => {
					uni.showToast({ title: '支付成功', icon: 'success' })
					this.$refs.infiniteList.refresh()
				},
				onFail: () => {
					uni.showToast({ title: '支付失败', icon: 'none' })
				},
				onCancel: () => {
					uni.showToast({ title: '取消支付', icon: 'none' })
				}
			});
		}
	},
	beforeDestroy() {
		if (this.timer) clearInterval(this.timer);
	}
}
</script>

<style lang="less" scoped>
.list {
	display: flex;
	padding: 12rpx 0;
	line-height: 36rpx;

	&-label {
		color: #65667D;
	}

	&.list-btn {
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		border-top: 1px solid #EEEEEE;
		margin-top: 30rpx;
		padding-top: 24rpx;

		button {
			width: 196rpx;
			height: 76rpx;
			line-height: 76rpx;
			margin: 0;
			font-weight: normal;
		}
	}

	&.list-time {
		color: #65667D;
		display: flex;
		justify-content: flex-end;
		padding-bottom: 0;

		label {
			color: #FA3E3E;
		}
	}
}
</style>
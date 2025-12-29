<template>
	<Popup :visible="visible" position="bottom">
		<view class="logistics" v-if="visible">
			<Header :back="handleClose">查看物流</Header>
			<view class="c">
				<view style="margin-top: 20rpx;">
					<OrderDetail :record="order" :displayRange="[1]" />
				</view>
				<view class="card info">
					<template v-if="logisticsInfo">
						<Loading v-if="loading" />
						<view class="card-title">
							<view class="card-title-left">
								{{ logisticsInfo?.address_info?.shipping_name }}
							</view>
							<view class="card-title-right">
								<label class="order">{{ logisticsInfo?.address_info?.shipping_code }}</label>|<button
									class="copy"
									@click="handleCopy(logisticsInfo?.address_info?.shipping_code)">复制</button>
							</view>
						</view>
						<view class="address">
							<image src="/static/positioning.svg" class="icon" mode="widthFix"></image>
							<view class="address-details">
								收货信息：{{ logisticsInfo?.address_info?.address || '' }}
							</view>
						</view>
						<view class="progress">
							<view class="progress-item" v-for="item in logisticsInfo?.shipping_list"
								:key="item.acceptTime">
								<view class="progress-item-line1">
									<view class="progress-item-line1-1" v-if="item?.firstStatusName">
										{{ item?.firstStatusName }}</view>
									<view class="progress-item-line1-2">{{ item?.acceptTime }}</view>
								</view>
								<view class="progress-item-line2">
									【{{ item?.acceptAddress}}】{{ item?.remark }}
								</view>
							</view>
						</view>
					</template>
				</view>
			</view>
		</view>
	</Popup>
</template>

<script>
import Header from '@/components/Header.vue'
import OrderDetail from '@/components/OrderDetail.vue';
import Popup from '@/components/Popup.vue';
import Loading from '@/components/Loading.vue';
import apiRecharge from '@/api/recharge';
import {
	copyToClipboard
} from '@/utils/base'

export default {
	name: 'Logistics',
	components: {
		Header,
		Popup,
		OrderDetail,
		Loading
	},
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		order: {
			type: Object,
			default: () => { }
		}
	},
	data() {
		return {
			logisticsInfo: null,
			loading: false
		};
	},
	mounted() {
	},
	methods: {
		handleCopy(text) {
			copyToClipboard(text)
		},
		handleClose() {
			this.$emit('close');
		},
		// 获取物流信息
		async getLogistics() {
			this.loading = true
			apiRecharge.logisticsTrace(this.order.id).then(res => {
				this.logisticsInfo = res.data;
			}).finally(() => {
				this.loading = false
			});
		}
	},
	watch: {
		visible(newVal) {
			if (newVal) {
				this.getLogistics();
			}
		}
	},
}
</script>

<style lang="less" scoped>
.logistics {
	height: 100vh;
	background-color: #F8F8F8;
	overflow-y: auto;
}

.info {
	margin-top: 20rpx;

	.card-title {

		&-right {
			display: flex;
			gap: 18rpx;

			.order {
				color: #65667D;
			}

			.copy {
				background-color: transparent;
				font-size: 28rpx;
				padding: 0;
				height: auto;
				line-height: inherit;
			}
		}
	}

	.address {
		display: flex;
		gap: 20rpx;
		margin: 28rpx 30rpx auto;

		.icon {
			width: 32rpx;
			flex-shrink: 0;
		}

		&-details {
			font-weight: 500;
		}
	}

	.progress {
		margin: 28rpx 30rpx auto;
		padding-left: 46rpx;
		box-sizing: border-box;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			width: 2rpx;
			background-color: #D3D3D3;
			top: 47rpx;
			bottom: 62rpx;
			left: 16rpx;
		}

		&-item {
			color: #999;
			padding: 24rpx 0;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				width: 10rpx;
				height: 10rpx;
				border-radius: 10rpx;
				background-color: #D3D3D3;
				top: 38rpx;
				left: -34rpx;
			}

			&:last-child {
				border-bottom: none;
			}

			&-line1 {
				display: flex;
				gap: 12rpx;
				align-items: center;

				&-1 {
					font-size: 32rpx;
					color: #010101
				}
			}
		}
	}
}
</style>
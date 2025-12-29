<template>
	<view @click="handleSwitch(true)">
		<slot></slot>
	</view>
	<Popup :visible="open" @close="handleSwitch(false)">
		<view class="recharge">
			<view class="top">
				<view class="label">
					充值套餐
				</view>
				<image src="/static/back.svg" class="cancel" mode="widthFix" @click="handleSwitch(false)"></image>
			</view>
			<Recharge :className="'modal'" :callbacks="callbacks" v-if="open" />
		</view>
	</Popup>
</template>

<script>
import Recharge from './Recharge.vue';
import Popup from './Popup.vue';
export default {
	name: "ModalRecharge",
	components: {
		Recharge,
		Popup
	},
	props: {
		onSuccess: {
			type: Function,
			default: () => { }
		}
	},
	data() {
		return {
			serviceProductList: [],
			checkedIndex: 0,
			open: false,
			callbacks: {
				onSuccess: () => {
					this.onSuccess?.()
					this.handleSwitch(false)
				},
			}
		};
	},
	mounted() { },
	methods: {
		handleSwitch(state) {
			this.open = state
		}
	}
}
</script>

<style lang="less">
.recharge {
	position: fixed;
	inset: 0;
	top: auto;
	background-color: #fff;
	border-radius: 16rpx 16rpx 0rpx 0rpx;
	padding: 30rpx;

	.top {
		display: flex;
		justify-content: space-between;
		margin-bottom: 22rpx;

		.label {
			font-size: 32rpx;
			font-weight: 500;
		}

		.cancel {
			width: 40rpx;
		}
	}

	.no-service-product {
		color: #C9C9C9;
		padding: 24rpx 0;
		text-align: center;
	}
}
</style>
<template>
	<Popup :visible="visible" @close="handleClose">
		<view class="c">
			<Card title="选择产品规格">
				<template #extra>
					<image src="/static/back.svg" mode="scaleToFill" @click="handleClose" class="close-icon" />
				</template>
			</Card>
			<view class="list">
				<view class="list-item" v-for="item in productSpecList" @click="selectProductSpec(item)"
					:class="{ active: currentProductSpec.id === item.id }">
					<view>
						<view>{{ item.spec_name }}</view>
						<view v-if="(item.accuracy_width || item.accuracy_height) && [2, 3].includes(params?.cate_id)">
							{{ [item.accuracy_width,item.accuracy_height].join('*') }}cm
						</view>
					</view>
				</view>
			</view>
			<view class="list-wrap">
				<view class="list-wrap-left">商品价格</view>
				<view class="list-wrap-right list-wrap-right-price">￥{{ currentProductSpec?.price_adjustment }}</view>
			</view>
		</view>
		<view class="bottom-btn-wrapper">
			<button class="btn-3" @click="onSubmit({ spec: this.currentProductSpec })">确认下单</button>
		</view>
	</Popup>
</template>

<script>
	import Popup from '@/components/Popup.vue'
	import Card from '@/components/Card.vue'
	import apiUser from '@/api/user'
	import apiPrint from '@/api/print'
	export default {
		name: "ModalProductSpec",
		components: {
			Popup,
			Card
		},
		props: {
			visible: false,
			params: null,
			onSubmit: {
				type: Function,
				default: () => {}
			}
		},
		data() {
			return {
				productSpecList: [],
				currentProductSpec: {},
				userInfo: null,
				balanceDeduct: {
					type: Boolean,
					default: true
				},
				balance_amount: 0
			};
		},
		mounted() {},
		watch: {
			visible(val) {
				if (val) {
					this.reqProductSpecList();
					this.reqUserInfo();
				}
			},
			userInfo(val) {
				if (val) {
					this.calculateMaxDiscountAmount();
				}
			},
			currentProductSpec(val) {
				this.calculateMaxDiscountAmount()
			},
		},
		methods: {
			handleClose() {
				this.$emit("close");
			},
			reqProductSpecList() {
				// 请求产品规格列表
				const product_id = this.params?.id;
				if (!product_id) {
					return;
				}
				apiPrint.productSpecList({
					product_id
				}).then(res => {
					this.productSpecList = res.data.data;
					this.selectProductSpec(this.productSpecList[0]);
				}).catch(err => {
					console.log(err);
				});
			},
			// 计算最大折扣金额
			calculateMaxDiscountAmount() {
				const balance_amount = this.balanceDeduct ? (this.userInfo?.balance || 0) : 0;
				const price_adjustment = this.currentProductSpec?.price_adjustment || 0;
				const _balance_amount = balance_amount > price_adjustment ? price_adjustment : balance_amount;
				this.balance_amount = _balance_amount;
				this.currentProductSpec.balance_amount = balance_amount;
			},
			// 选择产品规格
			selectProductSpec(item) {
				this.currentProductSpec = {
					...this.currentProductSpec,
					...item
				};
			},
			reqUserInfo() {
				if (this.userInfo) return;
				apiUser.getUserInfo().then(res => {
					this.userInfo = res.data;
				}).catch(err => {
					console.log(err);
				});
			},
			handleBalanceDeduct() {
				this.balanceDeduct = !this.balanceDeduct;
				this.calculateMaxDiscountAmount();
			}
		}
	}
</script>

<style lang="less" scoped>
	.close-icon {
		width: 20px;
		height: 20px;
	}

	.list {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
		margin-bottom: 36rpx;

		&-item {
			width: 324rpx;
			height: 116rpx;
			background: #FFFFFF;
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			border: 2rpx solid #010101;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			line-height: 1.6;

			&.active {
				background-color: #010101;
				color: #fff;
			}
		}
	}

	.list-wrap {
		display: flex;
		justify-content: space-between;
		padding: 18rpx 0;

		&-left {
			label {
				display: flex;
				align-items: center;
			}
		}

		&-right {
			color: #FA3E3E;

			&-price {
				font-weight: bold;
				font-size: 36rpx;
			}
		}
	}
</style>
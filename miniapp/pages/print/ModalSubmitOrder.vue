<template>
	<view v-if="visible">
		<Popup :visible="visible" :closeOnMaskClick="true">
			<view class="submit-order" v-if="visible">
				<Header :back="back">提交订单</Header>
				<view class="c">
					<Card :styles="{ 'margin-top': '20rpx' }">
						<view class="address">
							<view class="address-left">
								<view class="address-left-top">
									{{ checkedAddress.name }}
									{{ checkedAddress.phone }}
								</view>
								<view class="address-left-bottom">
									{{ checkedAddress.address }}
								</view>
							</view>
							<view class="address-right" @click="updatePopupSisible(true)">
								修改<image src="/static/arrow.svg" class="icon" mode="aspectFill"></image>
							</view>
						</view>
					</Card>

					<Card :styles="{ 'margin-top': '20rpx' }">
						<view class="order">
							<view class="order-info">
								<image :src="params?.product?.main_image" class="image" mode="widthFix"></image>
								<view class="order-info-desc">
									<view class="">
										{{ params?.product?.cate_name }}
									</view>
									<view class="">
										{{ params?.product?.product_name }}，{{ params?.spec?.spec_name }}
									</view>
								</view>
							</view>
							<view class="order-price">
								<view class="">
									￥{{ params?.spec?.price_adjustment }}
								</view>
								<view class="order-price-count">
									x1
								</view>
							</view>
						</view>
						<view class="pre-list pre-image">
							<view class="">
								打印照片
							</view>
							<image :src="getThumbnailUrl(params?.url, 80)" class="image" mode="aspectFit"></image>
						</view>
						<view class="pre-list">
							<view class="">
								商品总价
							</view>
							<view class="">
								￥{{ parseFloat(params?.spec?.price_adjustment * (params?.spec?.num || 1)).toFixed(2) }}
							</view>
						</view>
						<view class="pre-list" v-if="Number(userInfo?.balance) > 0">
							<view class="">
								<label style="display: flex;align-items: center;" @click="handleBalanceDeduct">
									<checkbox :checked="balanceDeduct" style="transform:scale(0.8)" color="#010101" />
									佣金抵扣
								</label>
							</view>
							<view class="">
								-¥{{ Number(max_balance_amount).toFixed(2) }}
							</view>
						</view>
						<view class="pre-list">
							<view class="">

							</view>
							<view class="">
								实付款 <label class="price-amount">
									￥{{ ((Number(params.spec?.price_adjustment) || 0) *
									(params?.spec?.num || 1) -
									(Number(balance_amount) || 0)).toFixed(2)
								}}</label>
							</view>
						</view>
					</Card>
					<view class="">
						<view class="agreement-wrapper">
							<label>请阅读</label>
							<navigator url="/pages/user/agreement?type=payment_agreement">《支付服务条款》</navigator>
						</view>
						<view class="">
							<button class="btn-3" @click="handleCreateOrder">确认协议并支付</button>
						</view>
					</view>
				</view>
			</view>
		</Popup>
		<Popup :visible="addressvisible" @onClose="updatePopupSisible(false)">
			<view></view>
			<Address :onDataLoad="loadAddress" :onSelect="handleSelectAddress" :selectedAddress="checkedAddress"
				@onClose="updatePopupSisible(false)" mode="selector" />
		</Popup>
	</view>
</template>

<script>
	import Header from '@/components/Header.vue'
	import Card from '@/components/Card.vue'
	import Popup from '@/components/Popup.vue'
	import Address from '@/components/Address.vue'
	import {
		createAndPayOrder
	} from '@/utils/recharge'
	import {
		handleUpload
	} from '@/utils/upload'
	import apiUser from '@/api/user'
	import {
		getThumbnailUrl
	} from '@/utils/base'
	export default {
		name: 'ModalSubmitOrder',
		components: {
			Header,
			Card,
			Popup,
			Address,
		},
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			params: {
				type: Object,
				default: () => ({})
			},
			back: {
				type: Function,
				default: () => {}
			},
		},
		data() {
			return {
				checkedAddress: {},
				addressvisible: false,
				balance_amount: 0,
				max_balance_amount: 0,
				price_adjustment: 0,
				userInfo: null,
				balanceDeduct: true
			};
		},
		mounted() {},
		methods: {
			getThumbnailUrl,
			reqUserInfo() {
				apiUser.getUserInfo().then(res => {
					this.userInfo = res.data;
					this.calculateMaxDiscountAmount();
				}).catch(err => {
					console.log(err);
				});
			},
			// 计算折扣金额
			calculateMaxDiscountAmount() {
				// this.userInfo?.balance 不存在则终止计算，有为0的情况
				if (this.userInfo?.balance == null || isNaN(this.userInfo.balance)) return;
				const balance_amount = Number(this.balanceDeduct ? (this.userInfo?.balance || 0) : 0);
				const price_adjustment = Number(this.params?.spec?.price_adjustment || 0);
				const _balance_amount = balance_amount > price_adjustment ? price_adjustment : balance_amount;
				this.balance_amount = _balance_amount;
				this.max_balance_amount = this.userInfo?.balance > price_adjustment ? price_adjustment : this.userInfo
					?.balance;
			},
			updatePopupSisible(state) {
				this.addressvisible = state
			},
			loadAddress(list) {
				const _ad = list.find(item => item.is_default)
				this.checkedAddress = _ad || list?.[0] || {}
			},
			async handleCreateOrder() {
				const address_id = this.checkedAddress.id
				if (!address_id) {
					uni.showToast({
						title: '请选择地址',
						icon: 'none'
					})
					this.updatePopupSisible(true)
					return
				}
				const {
					spec = {}, product = {}, url = '', styleTransferId, photo_order_id
				} = this.params || {}
				const result_image = await handleUpload(url)
				const {
					id: product_spec_id,
					price_adjustment,
					num = 1
				} = spec || {}
				const total_amount = price_adjustment * num;
				const payment_amount = (Number(this?.params.spec?.price_adjustment || 0)) -
					(Number(this.balance_amount) || 0);

				const params = {
					"order_type": 2, //订单类型 1充值订单 2打印订单
					"photo_order_id": photo_order_id || styleTransferId, //生图订单id
					"num": 1, //购买数量
					"service_product_id": "",
					"order_count": "",
					product_id: product?.id, //产品id
					total_amount,
					product_spec_id,
					payment_amount, //支付金额
					balance_amount: this.balance_amount, //佣金抵扣
					address_id, //地址id
					result_image: result_image.url
				}
				createAndPayOrder(params, {
					onSuccess: () => {
						uni.redirectTo({
							url: '/pages/print/orders'
						})
					},
				})
			},
			handleSelectAddress(data) {
				this.checkedAddress = data
				this.addressvisible = false
			},
			handleBalanceDeduct() {
				this.balanceDeduct = !this.balanceDeduct;
				this.calculateMaxDiscountAmount();
			}
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					this.reqUserInfo()
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.submit-order {
		height: 100vh;
		background-color: #F8F8F8;
	}

	.address {
		display: flex;
		justify-content: space-between;

		&-left {
			&-top {}

			&-bottom {
				color: #666666;
				font-size: 24rpx;
				margin-top: 10rpx;
			}
		}

		&-right {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.icon {
				width: 28rpx;
				height: 28rpx;
			}
		}
	}

	.order {
		display: flex;
		justify-content: space-between;

		&-info {
			display: flex;
			gap: 22rpx;
			align-items: center;

			.image {
				width: 160rpx;
				height: 160rpx;
			}
		}

		&-price {
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			&-count {
				color: #65667D;
				text-align: right;
			}
		}
	}

	.pre-list {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 22rpx 0;

		&.pre-image {
			margin-top: 30rpx;
			border-bottom: 2rpx solid #EEEEEE;
		}

		.image {
			width: 120rpx;
			height: 90rpx;
		}

		.price-amount {
			color: #FA3E3E;
			font-size: 36rpx;
			font-weight: 800;
		}
	}

	.agreement-wrapper {
		margin: 40rpx 0 20rpx;
		display: flex;

		label {
			color: #C9C9C9;
		}
	}
</style>
<template>
	<z-paging ref="paging" v-model="dataList" @query="requestOrdersList">
		<template #top>
			<Header>分销信息</Header>
			<view class="c">
				<view class="card info">
					<view class="info-top">
						<view class="info-top-left">
							<view class="label">
								佣金余额（元）
							</view>
							<view class="amount">
								<view class="amount-symbol">
									<label>￥</label>{{ userInfo?.balance || '0.00' }}
								</view>
								<view class="amount-freeze">
									冻结金额：{{ userInfo?.balance_freeze || '0.00' }}元
								</view>
							</view>
							<view class="count">
								微信提现
							</view>
						</view>
						<view class="info-top-right">
							<view></view>
							<navigator url="/pages/distributor/withdrawal">
								<button class="btn">提现</button>
							</navigator>
						</view>
					</view>
				</view>
			</view>
			<view class="tabs-wrapper">
				<Tabs :tabs="tabList" v-model="activeTab" @onChange="onTabChange" :className="'flex-1'" />
			</view>
		</template>
		<view :class="['list', `list-${activeTab}`]">
			<view class="list-item" v-for="(item, index) in dataList">
				<view class="list-item-left" :key="index">
					<view class="label" v-if="activeTab === 0">
						{{ item?.type_desc }}
					</view>
					<view class="label" v-if="activeTab === 1">
						{{ item?.status_desc }} <label class="remark">{{ item?.remark }}</label>
					</view>
					<view class="label" v-if="activeTab === 2">
						<image :src="item?.avatar || defaultAvatar" class="avatar" mode="widthFix"></image>
						{{ item?.nickname }}
					</view>
					<view class="date" v-if="activeTab !== 2">
						{{ item?.create_time }}
					</view>
				</view>
				<button class="btn-3" v-if="activeTab === 1 && item?.show_confirm === 1"
					style="width: 140rpx;height: 48rpx;line-height: 44rpx;font-size: 24rpx;border-radius: 3px;padding: 0;"
					@click="getWithdrawOrderPackInfo(item?.id)">确认收款</button>
				<view :class="['list-item-right', `list-item-right${item?.commission_type || 0}`]"
					v-if="activeTab !== 2">
					{{ item?.amount }}元
				</view>
				<view :class="['list-item-right']" v-if="activeTab === 2" style="color: #65667D;">
					{{ formatDate(item?.create_time) }}
				</view>
			</view>
		</view>
		<template #bottom>
			<view class="c footer">
				<DistributionQRcode>
					<button class="btn-3">邀请好友</button>
				</DistributionQRcode>
				<view class="bottom-statistic">{{ statisticData?.text }}：<label>{{ statisticData?.value || ''
				}}</label>
				</view>
			</view>
		</template>
		<template #empty>
			<Empty />
		</template>
	</z-paging>
</template>

<script>
	import Header from '@/components/Header.vue'
	import Tabs from '@/components/Tabs.vue'
	import InfiniteList from '@/components/InfiniteList.vue'
	import DistributionQRcode from '@/components/DistributionQRcode.vue'
	import Empty from '@/components/Empty.vue'

	import apiDistributor from '@/api/distributor'
	import apiUser from '@/api/user'
	import {
		getCode
	} from '@/utils/user'

	export default {
		async onShareAppMessage() {
			const imageUrl = await getCode()
			return {
				title: 'LaLaMan',
				path: `/pages/index/index?from=share&pid=${this.userInfo.id}`,
				imageUrl
			}
		},
		components: {
			Header,
			Tabs,
			InfiniteList,
			DistributionQRcode,
			Empty
		},
		data() {
			return {
				defaultAvatar: '/static/vector.svg',
				tabList: [{
					label: '佣金明细'
				}, {
					label: '提现记录'
				}, {
					label: '推荐记录'
				}],
				activeTab: 0,
				dataList: [],
				statisticData: null,
				params: null,
				userInfo: {},
				isFirstLoad: true
			};
		},
		onShow() {
			this.requestUserInfo()
			if (!this.isFirstLoad) {
				this.$refs.paging.reload(true);
			} else {
				this.isFirstLoad = false
			}
		},
		onLoad() {},
		methods: {
			onTabChange(key) {
				this.activeTab = key
				this.$refs.paging.reload(true);
			},
			formatDate(dateStr) {
				return dateStr?.split(' ')[0] || ''
			},
			async getWithdrawOrderPackInfo(id) {
				uni.showLoading({
					title: '数据加载'
				})
				const res = await apiUser.getWithdrawOrderPackInfo({
					id
				})
				uni.hideLoading()
				const {
					code,
					data = {}
				} = res || {}
				if (code === 1) {
					if (wx.canIUse('requestMerchantTransfer')) {
						uni.requestMerchantTransfer({
							...data,
							success: (res) => {
								this.$refs.paging.refresh()
							},
							fail: (res) => {
								uni.showToast({
									title: '提现失败',
									icon: 'none'
								})
							},
						})
					} else {
						uni.showToast({
							title: '你的微信版本过低，请更新至最新版本。',
							icon: 'none'
						})
					}

				}
			},
			async requestOrdersList(pageNo, pageSize) {
				console.log('this.activeTab', this.activeTab);
				if (this.activeTab === null) return;
				const params = {
					page: pageNo,
					pageSize,
					...this.params
				}
				let res = null
				if (this.activeTab === 0) {
					res = await apiDistributor.userBalanceLog(params)
					this.statisticData = {
						text: '累计佣金',
						value: (res?.data?.statistic?.total || '0.00') + '元'
					}
				}
				if (this.activeTab === 1) {
					res = await apiDistributor.withDrawOrder(params)
					this.statisticData = {
						text: '累计提现',
						value: (res?.data?.statistic?.total || '0.00') + '元'
					}
				}
				if (this.activeTab === 2) {
					res = await apiDistributor.userInvite(params)
					this.statisticData = {
						text: '累计邀请',
						value: (res?.data?.statistic?.total || '0') + '人'
					}
				}

				console.log('res?.data?.data || []', res?.data?.data || []);

				this.$refs.paging.complete(res?.data?.data || []);
			},
			async requestUserInfo() {
				const res = await apiUser.getUserInfo()
				this.userInfo = res?.data || {}
			}
		},
		watch: {
			activeTab: {
				handler(newVal) {
					this.params = {
						_t: new Date().getTime()
					}
					console.log('newVal', newVal);
				}
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
					font-weight: 500;
					display: flex;
					gap: 6rpx;
					align-items: baseline;

					&-symbol {
						label {
							font-size: 24rpx;
						}
					}

					&-freeze {
						font-size: 24rpx;
					}
				}

				.count {
					margin-top: 44rpx;
					margin-bottom: 26rpx;
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
			}
		}
	}

	.tabs-wrapper {
		margin-top: 20rpx;
	}

	.list {
		background-color: #fff;
		padding-top: 4rpx;

		&-item {
			display: flex;
			justify-content: space-between;
			margin: 0 30rpx;
			padding: 32rpx 0;
			border-bottom: 2rpx solid #EEEEEE;
			align-items: center;

			&-left {
				.label {
					display: flex;
					align-items: center;
					gap: 22rpx;

					.remark {
						color: #FA3E3E;
					}

					.avatar {
						width: 76rpx;
						height: 76rpx;
						border-radius: 76rpx;
					}
				}

				.date {
					color: #65667D;
					margin-top: 4px;
				}
			}

			&-right {
				&.list-item-right0 {
					&::before {
						content: '-';
					}
				}

				&.list-item-right1 {
					color: #FA3E3E;

					&::before {
						content: '+';
					}
				}
			}
		}
	}

	.bottom-statistic {
		margin-top: 6rpx;
		color: #65667D;
		text-align: center;

		label {
			color: #FA3E3E;
		}
	}

	.footer {
		padding: 20rpx 0 88rpx;
	}
</style>
<template>
	<Header>生图订单</Header>
	<view class="tabs">
		<Tabs :tabs="tabList" className="flex-1" v-model="activeTab" @onChange="onTabChange" />
	</view>
	<InfiniteList :fetchFn="requestOrdersList" :params="{ order_type: tabList[activeTab].value }"
		:enablePullDownRefresh="true" :styles="{ height: 'calc(100vh - 298rpx)' }">
		<template #default="{ item }">
			<Card :title="`订单时间：${item?.create_time}`" :styles="{ margin: '20rpx 30rpx auto' }">
				<view class="order-content">
					<image :src="getThumbnailUrl(item?.ai_original_img, 80)" class="image" mode="aspectFit" />
					<view class="order-content-right">
						<view class="order-content-right-title">{{ item?.name }}</view>
						<view class="btn-wrapper">
							<button class="btn-3" @click="onPreview(item)">预览</button>
						</view>
					</view>
				</view>
			</Card>
		</template>
	</InfiniteList>
</template>

<script>
	import _ from 'lodash'
	import Header from '@/components/Header.vue'
	import Tabs from '@/components/Tabs.vue'
	import Card from '@/components/Card.vue'
	import OrderDetail from '@/components/OrderDetail.vue';
	import InfiniteList from '@/components/InfiniteList.vue'
	import {
		getThumbnailUrl
	} from '@/utils/base';
	import apiUser from '@/api/user';


	export default {
		async onShareAppMessage() {
			return {
				title: 'LaLaMan',
				path: `/pages/index/index`,
				imageUrl
			}
		},
		components: {
			Header,
			Tabs,
			Card,
			OrderDetail,
			InfiniteList
		},
		data() {
			return {
				activeTab: 0,
				tabList: [{
						label: '风格转绘',
						value: 1
					},
					{
						label: '打印服务',
						value: 2
					},
				],
			};
		},
		onLoad() {
			this.activeTab = 0;
		},
		methods: {
			getThumbnailUrl,
			onTabChange(index) {
				this.activeTab = index
			},
			async requestOrdersList(params) {
				return apiUser.photoOrder(params)
			},
			onPreview(item) {
				const ai_original_img = item?.ai_original_img || ''
				if (!ai_original_img) {
					uni.showModal({
						title: '提示',
						content: '预览生成中，请稍后再试',
						showCancel: false,
					})
					return
				}
				const photo_style_id = this.activeTab === 0 ? item.photo_style_id : item.product_id
				const params = {
					..._.pick(item, ['name', 'original_img', 'ai_original_img']),
					photo_style_id,
					styleTransferId: item.id,
					width: 5120,
					height: 6500,
				}
				if (this.activeTab === 0) {
					uni.navigateTo({
						url: `/pages/styleTransfer/preview?params=${JSON.stringify(params)}`
					})
				}
				if (this.activeTab === 1) {
					uni.navigateTo({
						url: `/pages/print/index?styleTransferId=${item.photo_style_id}&url=${ai_original_img}&productId=${item.product_id}&cateId=${item?.product?.cate_id}&photo_order_id=${item.id}&skipCreate=1&isPreview=1`
					})
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.cover {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		background-color: rgba(255, 255, 255, 0.9);
	}

	.inner {
		text-align: center;
		margin-top: 200rpx;
		font-size: 32rpx;
	}

	.tabs {
		.tab-item {
			width: 50%;
		}
	}

	.order-content {
		display: flex;
		justify-content: space-between;

		.image {
			width: 160rpx;
			height: 160rpx;
			background-color: #eee;
		}

		&-right {
			width: calc(100% - 180rpx);
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			&-title {
				font-size: 24rpx;
			}

			.btn-wrapper {
				display: flex;
				justify-content: flex-end;
				gap: 20rpx;

				button {
					margin: 0;
					width: 140rpx;
					height: 68rpx;
					line-height: 68rpx;
				}
			}
		}
	}
</style>
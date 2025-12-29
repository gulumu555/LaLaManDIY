<template>
	<Header>风格转绘</Header>
	<view class="style-transfer-wrapper">
		<image class="image-top" :src="getThumbnailUrl(originImage, 350)" mode="aspectFit"></image>
		<view class="style-transfer">
			<Tabs :tabs="categoryList" v-model="activeKey" @onChange="onTabChange" className="no-line font36" />
			<scroll-view scroll-x :scroll-with-animation="true" :show-scrollbar="false">
				<view class="image-list scroll-content">
					<view class="image-list-item" :class="{ 'active': item.id === currentPhotoStyle.id }"
						v-for="item in photoStyleList" @click="onChangeItem(item)">
						<image :src="item?.style_img" class="image" mode=""></image>
						<view class="name">
							{{ item.style_name }}
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="" v-if="photoStyleList.length === 0">
				<Spin v-if="loading" />
				<Empty v-else></Empty>
			</view>

			<view class="btn-wrapper">
				<Create :params="createParams" :callbacks="createCallbacks" loadingTips="可稍后在生图订单中查看">
					<button class="btn-3">保存</button>
				</Create>
			</view>
		</view>
	</view>
</template>

<script>
import _ from 'lodash'
import Header from '@/components/Header.vue'
import Tabs from '@/components/Tabs.vue'
import Empty from '@/components/Empty.vue'
import Spin from '@/components/Spin.vue'
import Create from '@/components/Create.vue'
import apiPrint from '@/api/print'
import { handleUpload } from '@/utils/upload'
import { getThumbnailUrl } from '@/utils/base'
export default {
	components: {
		Header,
		Tabs,
		Empty,
		Create,
		Spin
	},
	data() {
		return {
			activeKey: -1,
			categoryList: [],
			photoStyleList: [],
			currentPhotoStyle: {},
			createOrderParams: {},
			loading: true,
			originImage: '',
			pollTimer: null,
			createParams: {},
			createCallbacks: {}
		};
	},
	onLoad(options) {
		this.initParams(options)
	},
	methods: {
		getThumbnailUrl,
		async initParams(options) {
			const url = options.url
			const original_img = await handleUpload(decodeURIComponent(url))
			this.originImage = original_img.url
			this.reqCategoryList()
			this.createCallbacks = {
				onSuccess: (data) => {
					const { ai_original_img = '', styleTransferId = '' } = data
					const params = { ...this.createParams, ai_original_img, styleTransferId }
					uni.navigateTo({
						url: `/pages/styleTransfer/preview?params=${JSON.stringify(params)}`
					});
				}
			}
		},
		reqCategoryList() {
			apiPrint.categoryList({
				type: 2,
				origin: 2
			}).then(res => {
				this.categoryList = res?.data?.map(item => ({
					value: item?.id,
					label: item?.cate_name
				}))
				this.activeKey = 0
			})
		},
		reqPhotoStyleList(cate_id) {
			apiPrint.photoStyleList({
				cate_id
			}).then(res => {
				this.photoStyleList = res?.data?.data?.map(item => ({
					..._.pick(item, ['id', 'style_name', 'style_img'])
				}))
				this.onChangeItem(this.photoStyleList?.[0] || {})
			})
		},
		onTabChange(key) {
			this.activeKey = key
		},
		onChangeItem(item) {
			this.currentPhotoStyle = item
		},
	},
	watch: {
		activeKey(newVal) {
			const cate_id = this.categoryList[newVal]?.value
			cate_id && this.reqPhotoStyleList(cate_id);
		},
		currentPhotoStyle: {
			handler(newVal) {
				const { id: photo_style_id, style_name: name } = newVal
				this.createParams = {
					name,
					original_img: this.originImage,
					photo_style_id,
					product_id: 0,
					order_type: 1,
					is_strength: 0,
					width: 5120,
					height: 6500,
				}
			},
			deep: true
		}
	}
}
</script>

<style lang="less" scoped>
.style-transfer-wrapper {
	.style-transfer {
		padding: 0 0 0 30rpx;
		background-color: #fff;

		.image-list {
			gap: 8rpx;
			align-items: center;

			&-item {
				color: #C9C9C9;
				text-align: center;
				font-size: 24rpx;
				font-weight: 500;

				.image {
					width: 180rpx;
					height: 240rpx;
					background-color: #eee;
				}

				&.active {
					color: #010101;
					font-size: 28rpx;

					.image {
						width: 196rpx;
						height: 264rpx;
					}
				}
			}
		}

		.btn-wrapper {
			box-sizing: border-box;
			padding: 30rpx 30rpx 108rpx 0;
		}
	}
}
</style>
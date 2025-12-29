<template>
	<Header>打印服务</Header>
	<view class="preview-photo">
		<image class="image-top" :src="getThumbnailUrl(decodeURIComponent(params.url || ''), 350)" mode="aspectFit">
		</image>
		<view class="style-transfer">
			<scroll-view scroll-x :scroll-with-animation="true" :show-scrollbar="false">
				<view class="tabs">
					<view :class="['tabs-item', currentTabsValue == item.value ? 'active' : '']"
						v-for="item in categoryList" @click="onChangeTabs(item.value)">
						{{ item?.label }}
					</view>
				</view>
			</scroll-view>
			<view class="image-list">
				<view :class="['image-list-item', currentProduct.id === item.id ? 'active' : '']"
					v-for="item in productList" :key="item.id" @click="onChangeProduct(item)">
					<image :src="getThumbnailUrl(decodeURIComponent(item?.main_image || ''), 120)" class="image" mode="aspectFit"></image>
					<view class="name">
						{{ item?.product_name }}
					</view>
				</view>
			</view>
			<view class="" v-if="productList.length === 0">
				<Empty />
			</view>
		</view>
		<view class="bottom-btn-wrapper">
			<button class="btn-3" @click="handleNextStep">{{ currentTabsValue === 4 ? '购买' : '下一步' }}</button>
		</view>
	</view>
	<ModalPrintPreview :visible="isVisiblePreview" :params="{ ...currentProduct, ...params }" :onSubmit="onModalSubmit"
		:back="() => isVisiblePreview = false" @close="isVisiblePreview = false" @onReSelectImage="onReSelectImage" />

	<ModalUVPrintCreate :visible="isVisibleUVPrintCreate" :params="params" @close="isVisibleUVPrintCreate = false"
		@createSuccess="onCreateSuccess" />

	<ModalUVPrintEdit :visible="isVisibleUVPrintEdit" :params="params" :isPreview="isPreview" :onSubmit="onModalSubmit"
		@close="isVisibleUVPrintEdit = false" @selectProductSpec="handleSelectProductSpec" />

	<ModalProductSpec :visible="isVisibleProductSpec" :params="currentProduct" :onSubmit="onModalSubmit"
		@close="isVisibleProductSpec = false" />

	<ModalSubmitOrder :visible="isVisibleSubmitOrder" :params="params" :back="() => isVisibleSubmitOrder = false" />

	<Create ref="createRef" :createDuration="60" loadingTips="可稍后在打印订单中查看" />

</template>

<script>
	import Header from '@/components/Header.vue'
	import Tabs from '@/components/Tabs.vue'
	import Create from '@/components/Create.vue'
	import Empty from '@/components/Empty.vue'
	import ModalPrintPreview from './ModalPrintPreview.vue'
	import ModalUVPrintCreate from './ModalUVPrintCreate.vue'
	import ModalUVPrintEdit from './ModalUVPrintEdit.vue'
	import ModalProductSpec from './ModalProductSpec.vue'
	import ModalSubmitOrder from './ModalSubmitOrder.vue'
	import apiPrint from '@/api/print'
	import {
		getThumbnailUrl
	} from '@/utils/base'
	export default {
		components: {
			Header,
			Tabs,
			Create,
			Empty,
			ModalPrintPreview,
			ModalUVPrintCreate,
			ModalUVPrintEdit,
			ModalProductSpec,
			ModalSubmitOrder
		},
		data() {
			return {
				currentTabsValue: 0,
				categoryList: [],
				productList: [],
				currentProduct: null,
				productSpecList: [],
				isVisiblePreview: false,
				isVisibleUVPrintCreate: false,
				isVisibleUVPrintEdit: false,
				isVisibleProductSpec: false,
				isVisibleSubmitOrder: false,
				params: {},
				initProductId: 0,
				categoryOriginId: 3,
				skipCreate: 0,
				isPreview: false
			};
		},
		onLoad(options) {
			const {
				styleTransferId = 0,
					photo_order_id = 0,
					url,
					cateId = 0,
					productId = 0,
					categoryOriginId = 3,
					skipCreate = 0,
					isPreview = 0 // 是否为预览
			} = options || {}

			this.skipCreate = skipCreate;
			cateId && this.onChangeTabs(cateId);
			this.categoryOriginId = categoryOriginId
			this.initProductId = productId
			this.params = {
				photo_order_id,
				styleTransferId,
				url: decodeURIComponent(url)
			}
			this.requestCategoryList();
			if (isPreview) {
				this.isPreview = isPreview;
				this.isVisibleUVPrintEdit = true;
			}
		},
		methods: {
			getThumbnailUrl,
			onChangeTabs(value) {
				this.currentTabsValue = value
			},
			requestCategoryList() {
				apiPrint.categoryList({
					type: 1,
					origin: this.categoryOriginId
				}).then(res => {
					this.categoryList = (res?.data || []).map(item => ({
						label: item.cate_name,
						value: item.id
					}));
					!this.currentTabsValue && this.categoryList?.[0]?.value && this.onChangeTabs(this.categoryList
						?.[0]?.value);
				})
			},
			onChangeProduct(item) {
				this.currentProduct = item
			},
			requestProductList() {
				apiPrint.productList({
					cate_id: this.currentTabsValue,
					page: 1,
					pageSize: 9999
				}).then(res => {
					this.productList = res?.data?.data || []
					this.currentProduct = this.productList?.[0]
				})
			},
			// 下一步
			handleNextStep() {
				// if (this.skipCreate == 1) {
				// 	this.isVisibleUVPrintEdit = true
				// 	return;
				// }
				const {
					id: product_id,
					cate_name: name
				} = this.currentProduct
				const params = {
					name,
					product_id,
					order_type: 2,
					is_strength: 0,
					original_img: decodeURIComponent(this.params.url || '')
				}
				const callbacks = {
					onSuccess: (data) => {
						data?.ai_original_img && (this.params.url = data?.ai_original_img);
						switch (this.currentTabsValue) {
							// case 3:
							// 	this.isVisibleUVPrintEdit = true
							// 	break
							// case 2:
							// case 4:
							// 	this.isVisibleProductSpec = true
							// 	break
							default:
								this.isVisibleUVPrintEdit = true
								// this.isVisiblePreview = true
								break
						}
					},
					onFail: () => {
						uni.showModal({
							title: '提示',
							content: '图片生成异常，请重试',
							showCancel: false
						})
					}
				}
				this.$refs.createRef.handleCreateStyleTransferOrder(params, callbacks)
			},
			handleSelectProductSpec(url) {
				this.params.url = url
				this.isVisibleProductSpec = true
			},
			onModalSubmit(data) {
				this.params = {
					...this.params,
					...data
				}
				this.isVisibleSubmitOrder = true
				this.isVisiblePreview = false
				this.isVisibleUVPrintEdit = false
				this.isVisibleProductSpec = false
			},
			onCreateSuccess(url) {
				this.params.url = url
				this.isVisibleUVPrintEdit = true
			},
			onReSelectImage(url) {
				this.params.url = url
			}
		},

		watch: {
			currentTabsValue: {
				handler(newVal) {
					newVal && this.requestProductList(newVal);
				}
			},
			currentProduct: {
				handler(newVal) {
					this.params = {
						...this.params,
						product: newVal,
					}
				}
			},
		}
	}
</script>

<style lang="less" scoped>
	.preview-photo {
		.style-transfer {
			margin: 30rpx 0 auto 30rpx;

			.tabs {
				display: flex;
				flex-direction: row;
				flex-wrap: nowrap;
				gap: 68rpx;
				width: max-content;

				&-item {
					color: #C9C9C9;
					font-size: 36rpx;

					&.active {
						color: #010101;
						font-weight: 500;
					}

					.name {
						margin-top: 12rpx;
					}
				}
			}

			.image-list {
				margin-top: 72rpx;
				display: flex;
				overflow-x: auto;
				scrollbar-width: none;
				overflow-y: hidden;
				flex-wrap: nowrap;
				gap: 8rpx;
				white-space: nowrap;
				align-items: center;

				&-item {
					color: #C9C9C9;
					text-align: center;
					font-size: 24rpx;
					font-weight: 500;

					.image {
						width: 180rpx;
						height: 240rpx;
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
		}
	}
</style>
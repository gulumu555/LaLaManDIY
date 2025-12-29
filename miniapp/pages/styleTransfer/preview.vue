<template>
	<view class="preview">
		<Header :title="'预览'" />
		<view class="image-wrapper">
			<image :src="url" mode="aspectFit" class="image-top" @load="onImageLoad" />
			<view class="tips">
				<view class="tips-text">新魂注入成功，保存或再试一版？</view>
			</view>
		</view>
		<view class="image-info-wrapper">
			<!-- <scroll-view scroll-x :scroll-with-animation="true" :show-scrollbar="false"> -->
			<view class="image-info">
				<template v-for="(sItem, index) in suitableSizeConfig" :key="sItem?.id">
					<template v-if="sItem?.is_strength === 0">
						<view class="image-info-item"
							:class="{ 'image-info-item-current': currentSize?.id === sItem?.id }"
							@tap="onChangeSize(sItem)">
							<view>{{ sItem.title }}</view>
							<view class="image-info-item-size">{{ sItem.width }}*{{ sItem.height }}</view>
						</view>
					</template>
					<template v-else-if="sItem?.is_strength === 1">
						<Create :params="{
							...createOrderParams, name: `${createOrderParams.name}`, is_strength: 1, width: sItem?.width, height: sItem?.height
						}" :callbacks="{
							onSuccess: (data) => {
								this.onChangeSize(sItem)
								this.url = data?.ai_original_img
							}
						}" :regenerate="true" tips="精度增强会消耗次数1次，确认需要执行吗？">
							<view class="image-info-item"
								:class="{ 'image-info-item-current': currentSize?.id === sItem?.id }">
								<view>{{ sItem.title }}</view>
								<view class="image-info-item-size">{{ sItem.width }}*{{ sItem.height }}</view>
							</view>
						</Create>
					</template>
				</template>
			</view>
			<!-- </scroll-view> -->

			<view class="download-btn-wrapper">
				<button class="btn-2" @tap="saveImageToAlbum">下载</button>
				<Create :params="createOrderParams" :regenerate="true">
					<button class="btn-2">重新生成</button>
				</Create>
			</view>

			<view class="btn-wrapper">
				<navigator :url="`/pages/print/index?styleTransferId=${params?.styleTransferId}&url=${url}`">
					<button class="btn-3">去打印</button>
				</navigator>
			</view>

			<view class="edit-wrapper">
				<navigator :url="`/pages/styleTransfer/index?url=${originalUrl}`">
					<button class="btn-edit">
						<image class="btn-icon" src="/static/edit.svg" mode="widthFix" />再次编辑
					</button>
				</navigator>
				<navigator url="/pages/index/index">
					<button class="btn-start">
						<image class="btn-icon" src="/static/camera-rotate.svg" mode="widthFix" />返回首页
					</button>
				</navigator>
			</view>
		</view>
	</view>
</template>

<script>
import _ from 'lodash'
import Header from '@/components/Header.vue'
import Create from '@/components/Create.vue'
import apiPrint from '@/api/print'
import {
	downloadAndSaveImage,
} from '@/utils/base'
import {
	suitableSizeConfig
} from '@/utils/constants'

export default {
	components: {
		Header,
		Create
	},
	data() {
		return {
			currentSize: {
				width: 0,
				height: 0
			},
			styleTransferId: Number,
			suitableSizeConfig: null,
			url: '',
			originalUrl: '',
			styleTransferItem: {
				type: Object,
				default: {}
			},
			params: {
				type: Object,
				default: {}
			},
			cropBoxStyle: {},
			createOrderParams: {
				type: Object,
				default: {}
			},
		}
	},
	onLoad(options) {
		const { params } = options
		let paramsObj = {}
		try {
			paramsObj = JSON.parse(params)
		} catch (error) {

		}
		this.params = paramsObj
		const {
			name,
			photo_style_id,
			styleTransferId = 0,
			order_type = 1,
			ai_original_img,
			original_img } = paramsObj
		this.url = ai_original_img
		this.originalUrl = original_img
		this.styleTransferId = styleTransferId

		this.createOrderParams = { name, original_img, photo_style_id, order_type }
	},
	methods: {
		onImageLoad(e) {
			const updated = [...suitableSizeConfig]
			updated[0] = {
				...updated[0],
				...e.detail
			}
			this.suitableSizeConfig = updated
			!this.currentSize?.id && (this.currentSize = updated[0]);
		},
		onChangeSize(item) {
			this.currentSize = item
		},
		getPhotoOrder(id) {
			if (!id) return;
			apiPrint.findPhotoOrder({
				id
			}).then(res => {
				this.styleTransferItem = res?.data || {}
			})
		},
		handleDownloadAndSaveImage(url) {
			downloadAndSaveImage(url)
		},
		async saveImageToAlbum() {
			try {
				// 1. 下载图片
				const downloadRes = await uni.downloadFile({ url: this.url });
				if (downloadRes.statusCode === 200) {
					// 2. 保存到相册
					await uni.saveImageToPhotosAlbum({ filePath: downloadRes.tempFilePath });
					uni.showToast({ title: '已保存到相册', icon: 'success' });
				} else {
					uni.showToast({ title: '下载失败', icon: 'none' });
				}
			} catch (e) {
				uni.showToast({ title: '保存失败', icon: 'none' });
				console.error('保存失败', e);
			}
		}
	},
	watch: {
		currentSize(newVal) {
			const {
				width,
				height,
				is_strength = 0
			} = newVal

			// 目标宽度限制（例如基于屏幕宽度）
			const maxBoxWidth = uni.getSystemInfoSync().windowWidth * 0.9

			// 计算等比例缩放后宽高
			const ratio = width / height
			let boxWidth = maxBoxWidth
			let boxHeight = boxWidth / ratio

			// 如果高度超过
			// 屏幕高度，则继续缩放
			const maxBoxHeight = uni.getSystemInfoSync().windowHeight * 0.45
			if (boxHeight > maxBoxHeight) {
				boxHeight = maxBoxHeight
				boxWidth = boxHeight * ratio
			}

			// 设置裁剪框 style
			this.cropBoxStyle = {
				width: `${boxWidth}px`,
				height: `${boxHeight}px`,
				cropSize: {
					width,
					height
				}
			}
			this.createOrderParams = { ...this.createOrderParams, width, height, is_strength }
		},
	}
}
</script>

<style lang="less" scoped>
.preview {
	background-color: #fff;
	min-height: 100vh;

	.spec-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;

		&-item {
			display: flex;
			justify-content: center;
			align-items: center;
			border: 2rpx solid #010101;
			border-radius: 16rpx;
			background-color: #fff;
			line-height: 40rpx;
			height: 108rpx;
			font-size: 24rpx;

			&.active {
				background-color: #010101;
				color: #fff;
			}

			&-text {
				text-align: center;
			}
		}
	}

	.download-btn-wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 44rpx;

		button {
			width: 320rpx;
			margin: 0;
		}
	}

	.btn-wrapper {
		box-sizing: border-box;
		margin-top: 30rpx;
	}

	.image-info-wrapper {
		margin: 46rpx;
	}

	.image-info {
		display: flex;
		// flex-direction: row;
		// flex-wrap: nowrap;
		// width: max-content;
		gap: 68rpx;
		margin: 0 18rpx;

		&-item {
			font-size: 28rpx;
			line-height: 40rpx;
			color: #C9C9C9;
			font-weight: bold;
			text-align: center;

			&-current {
				color: #010101;
			}

			&-size {
				font-size: 24rpx;
			}
		}
	}

	.edit-wrapper {
		margin-top: 100rpx;
		display: flex;
		justify-content: space-between;

		button {
			font-size: 30rpx;
			font-weight: bold;
			color: #010101;
			display: flex;
			gap: 8rpx;
			align-items: center;
			background-color: transparent;
			margin: 0;

			&:after {
				border: none;
			}

			.btn-icon {
				width: 56rpx;
			}
		}
	}
}

.tips {
	overflow: hidden;
	position: absolute;
	left: 50%;
	top: 30rpx;
	transform: translateX(-50%);
	pointer-events: none;
	z-index: 21;

	&-text {
		border-radius: 16rpx;
		padding: 16rpx 8rpx 16rpx 18rpx;
		white-space: nowrap;
		background: #fff;
		width: fit-content;
	}

	&::after {
		content: "";
		display: block;
		width: 0;
		height: 0;
		margin: -1px auto auto;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-top: 8px solid #fff;
	}
}
</style>
<template>
	<Popup :visible="visible" :closeOnMaskClick="true">
		<view class="preview" v-if="visible">
			<Header title="图片编辑" :back="handleBack" />
			<template>
				<view class="container" style="height: 730rpx;" v-if="params?.url">
					<bt-cropper ref="cropper" :imageSrc="getThumbnailUrl(params?.url, 350)" :dWidth="dWidth" cropperType="circle"
						@change="handleCropChange"></bt-cropper>
				</view>
				<view class="tool tool-1">
					<view class="tool-item square" :class="{ active: boxType === 'square' }" @click="boxType = 'square'"
						v-if="params?.product?.id !== 7">
					</view>
					<view class="tool-item circle"
						:class="{ active: boxType === 'circle' || params?.product?.id === 7 }"
						@click="boxType = 'circle'">
					</view>
				</view>
				<view class="tool tool-2">
					<view class="tool-2-item" :class="{ active: activeKey === 0 }" @click="activeKey = 0">
						<image src="/static/cropping.svg" mode="widthFix"></image>
						<view style="transform: translateX(4px);">裁剪</view>
					</view>
					<view class="tool-2-item" :class="{ active: activeKey === 1 }" @click="activeKey = 1">
						<image src="/static/matting.svg" mode="widthFix"></image>
						<view>抠图</view>
					</view>
				</view>
				<view class="bottom-btn-wrapper">
					<button class="btn-3" @click="handleCropImage">生成</button>
				</view>
			</template>
		</view>
	</Popup>
</template>

<script>
import Header from '@/components/Header.vue'
import Tabs from '@/components/Tabs.vue'
import Popup from '@/components/Popup.vue'
import { handleUpload } from '@/utils/upload'
import { getImageInfo, getThumbnailUrl } from '@/utils/base'

export default {
	name: 'ModalPrintPreview',
	components: {
		Header,
		Tabs,
		Popup,
	},
	props: {
		params: {},
		visible: {
			type: Boolean,
			default: false
		},
		back: {
			type: Function,
			default: () => { }
		},
	},
	data() {
		return {
			activeKey: 0,
			cropBoxStyle: {},
			boxType: 'square',
			printParams: {},
			imageInfo: {},
			dWidth: 0,
		}
	},
	mounted() {
		this.printParams = this.params
		getImageInfo(this.printParams.url).then(res => {
			this.imageInfo = res
		})
	},
	methods: {
		getThumbnailUrl,
		handleCropChange(res) {
			console.log(res, 'res');
			this.dWidth = res.width / this.imageInfo.width * 750
		},
		// 裁剪图片
		async handleCropImage(e) {
			try {
				uni.showLoading({
					title: '裁剪中...'
				})
				// 获取裁剪框的真实宽
				const { width: cropperWidth } = this.$refs.cropper.cropperRect; // 裁剪框的宽度
				const { width: imageWidth } = this.$refs.cropper.imageRect; // 图片的宽度
				const { width: originalWidth } = this.$refs.cropper.imageInfo; // 图片的原始宽度
				const ratio = cropperWidth / imageWidth; // 裁剪框的宽度与图片的宽度之比
				this.dWidth = originalWidth * ratio; // 裁剪框的宽度与图片的原始宽度之比
				// 等待1秒
				await new Promise(resolve => setTimeout(resolve, 1000))
				this.$refs.cropper.crop().then((res) => {
					handleUpload(res).then(res => {
						console.log('res+++++', res);
						this.$emit('createSuccess', res.url)
					}).finally(() => {
						uni.hideLoading()
					})
				}).finally(() => {
					uni.hideLoading()
				})
			} catch (e) {
				console.error('获取失败', e)
				uni.showToast({
					title: '裁剪失败，请稍后再试',
					icon: 'none'
				})
				uni.hideLoading()
			}
		},
		handleBack() {
			this.$emit('close')
		},
		handleSelectProductSpec() {
			this.$emit('selectProductSpec', this.printParams.url)
		}
	},
	watch: {
		activeKey(newVal) {
			if (newVal === 1) {
			}
		},
		params(val) {
			// 2 UV打印 3 3D打印，UV打印需要裁剪
			if (val?.product?.cate_id === 2) {
				this.step = 'step-create'
			} else if (val?.product?.cate_id === 3) {
				this.step = 'step-edit'
			}
		}
	}
}
</script>

<style lang="less" scoped>
.preview {
	min-height: 100vh;
	background-color: #FFFFFF;

	.tool {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 120rpx;
		padding: 40rpx 0;
	}

	.tool-1 {
		border-bottom: 1px solid #EEEEEE;

		.tool-item {
			width: 80rpx;
			height: 80rpx;
			border: 4rpx solid #EEEEEE;

			&.active {
				border-color: #010101;
			}
		}
	}

	.circle {
		border-radius: 80rpx;
	}
}

.tool-2 {
	gap: 140rpx !important;
	font-size: 20rpx;
	color: #999999;

	.active {
		color: #010101;
	}

	image {
		width: 56rpx;
		height: 56rpx;
		margin-bottom: 8rpx;
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
</style>
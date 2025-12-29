<template>
	<Popup :visible="visible" :closeOnMaskClick="true">
		<view class="preview" v-if="visible">
			<Header title="预览" :back="handleBack" />
			<image :src="getThumbnailUrl(printParams?.url, 350)" mode="aspectFit" class="image-top"
				@load="handleImageLoad" />
			<view class="c" style="margin-top: 80rpx;">
				<view class="btn-wrapper">
					<button class="btn-3" @click="handleSelectProductSpec">立即购买</button>
				</view>
				<view class="edit-wrapper">
					<button class="btn-edit" @click="handleReEdit">
						<image class="btn-icon" src="/static/edit.svg" mode="widthFix" />再次编辑
					</button>
					<navigator url="/pages/index/index">
						<button class="btn-start">
							<image class="btn-icon" src="/static/camera-rotate.svg" mode="widthFix" />返回首页
						</button>
					</navigator>
				</view>
			</view>
		</view>
	</Popup>
</template>

<script>
	import Header from '@/components/Header.vue'
	import Tabs from '@/components/Tabs.vue'
	import Popup from '@/components/Popup.vue'
	import {
		getThumbnailUrl
	} from '@/utils/base'

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
			isPreview: {
				type: Boolean,
				default: false
			},
			back: {
				type: Function,
				default: () => {}
			},
			onSubmit: {
				type: Function,
				default: () => {}
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
		mounted() {},
		methods: {
			getThumbnailUrl,
			handleImageLoad(e) {
				this.imageInfo = e.detail
			},
			handleCropChange(res) {
				this.dWidth = res.width / this.imageInfo.width * 750
			},
			handleBack() {
				if(this.isPreview){
					uni.navigateBack();
					return
				}
				this.$emit('close')
			},
			handleReEdit() {
				this.$emit('close')
			},
			handleSelectProductSpec() {
				this.$emit('selectProductSpec', this.printParams.url)
			}
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					this.printParams = this.params
				}
			},
			activeKey(newVal) {
				if (newVal === 1) {}
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
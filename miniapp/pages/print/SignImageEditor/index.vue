<template>
	<view class="image-top">
		<view class="crop-image-wrapper">
			<image :src="src" class="image" mode="aspectFit" @load="onImageLoad"> </image>
			<view class="crop-image" v-if="isShowSignature" :style="imageStyle" @touchstart="onTouchStart"
				@touchmove="onTouchMove" @touchend="onTouchEnd">
				<Signature1 :signatureData="signatureData" className="drag" v-if="selectedIndex === 0" />
				<Signature2 :signatureData="signatureData" className="drag" v-else-if="selectedIndex === 1" />
				<Signature3 :signatureData="signatureData" className="drag" v-else-if="selectedIndex === 2" />
				<Signature4 :signatureData="signatureData" className="drag" v-else-if="selectedIndex === 3" />
				<image src="@/static/error.svg" mode="widthFix" class="delete" @click="handleShowSignature(false)" />
			</view>
		</view>
	</view>
	<canvas canvas-id="signatureCanvas" :style="`width: ${Number(currentProductSpec?.accuracy_width)}px; height: ${Number(
      currentProductSpec?.accuracy_height
    )}px;position: absolute; left: -99999px;top: -99999px`" />
</template>

<script>
	import dayjs from "dayjs";
	import {
		getImageInfo,
	} from "@/utils/base";
	import {
		isNetworkImage,
	} from "@/utils/upload";

	import {
		useImageDrag
	} from "@/utils/useImageDrag";

	import Signature1 from "./Signature1.vue";
	import Signature2 from "./Signature2.vue";
	import Signature3 from "./Signature3.vue";
	import Signature4 from "./Signature4.vue";

	import {
		chooseAndUploadImage,
		handleUpload
	} from "@/utils/upload";

	export default {
		name: "SignImageEditor",
		components: {
			Signature1,
			Signature2,
			Signature3,
			Signature4,
		},
		setup() {
			// 使用 useImageDrag hooks
			const {
				imageX,
				imageY,
				imageStyle,
				onTouchStart,
				onTouchMove,
				onTouchEnd,
			} = useImageDrag();

			return {
				imageX,
				imageY,
				imageStyle,
				onTouchStart,
				onTouchMove,
				onTouchEnd,
			};
		},
		props: {
			isShowSignature: {
				type: Boolean,
				default: true,
			},
			signatureData: {
				type: Object,
				required: true,
			},
			src: {
				type: String,
				required: true,
			},
			currentProductSpec: {
				type: Object,
				default: {},
			},
			selectedIndex: {
				type: Number,
				default: 0,
			},
			originImageSize: {
				type: Object,
				default: {},
			},
		},
		data() {
			return {
				getImageInfo,
				canvasId: "signatureCanvas",
			};
		},
		watch: {},
		mounted() {},
		methods: {
			onImageLoad(e) {
				this.$emit("load", e);
			},
			// 生成签名图片
			handleGenerateSignature({
				callback
			}) {
				if (!this.currentProductSpec) {
					uni.showToast({
						title: "请选择尺寸",
						icon: "none",
					});
					return;
				}

				const tmpId = this.selectedIndex;
				const location = JSON.stringify(this.signatureData.location);
				const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
				const imageSize = JSON.stringify(this.originImageSize);
				const url =
					`/pages/print/createSignature?tmpId=${tmpId}&location=${location}&date=${date}&imageSize=${imageSize}`;
				uni.navigateTo({
					url,
					success: (res) => {
						res.eventChannel.on("dataFromCreateSignature", (res) => {
							this.mergeImages(res.data, callback);
						});
					},
				});
			},
			// 合成签名图标与原图，通过html2cavans返回图标base64图片：signatureRes
			async mergeImages(signatureRes, callback) {
				uni.showLoading({
					title: "合成中，请稍后..."
				});
				try {
					// 下载原图 & 签名图（base64 转文件）
					let originRes = this.src;
					if (isNetworkImage(this.src)) originRes = await this.downloadImage(this.src);
					const signaturePath = await this.base64ToFile(signatureRes);

					const ctx = uni.createCanvasContext(this.canvasId, this);

					// 获取原图尺寸
					const {
						width: imgW,
						height: imgH
					} = await this.getImageInfo(originRes);

					// 没有设置尺寸时使用原图尺寸
					if (!this.currentProductSpec.accuracy_width) {
						this.currentProductSpec.accuracy_width = imgW;
						this.currentProductSpec.accuracy_height = imgH;
					}

					const canvasWidth = Number(this.currentProductSpec.accuracy_width);
					const canvasHeight = Number(this.currentProductSpec.accuracy_height);

					// 计算缩放后的尺寸和偏移位置（居中）
					const canvasRatio = canvasWidth / canvasHeight;
					const imageRatio = imgW / imgH;

					let drawW, drawH, offsetX, offsetY;
					if (imageRatio > canvasRatio) {
						drawW = canvasWidth;
						drawH = drawW / imageRatio;
						offsetX = 0;
						offsetY = (canvasHeight - drawH) / 2;
					} else {
						drawH = canvasHeight;
						drawW = drawH * imageRatio;
						offsetX = (canvasWidth - drawW) / 2;
						offsetY = 0;
					}

					// 画原图（等比缩放 + 居中）
					ctx.drawImage(originRes, offsetX, offsetY, drawW, drawH);

					// 获取签名图尺寸
					const {
						width: sigW,
						height: sigH
					} = await this.getImageInfo(signaturePath);

					// 1. 获取 crop-image-wrapper 和 crop-image 的宽高
					const [cropRect, cropImageRect] = await new Promise((resolve) => {
						uni
							.createSelectorQuery()
							.in(this)
							.selectAll(".crop-image-wrapper, .crop-image")
							.boundingClientRect((rects) => resolve(rects))
							.exec();
					});

					// 2. rpx 转 px
					const systemInfo = uni.getSystemInfoSync();
					const rpx2px = systemInfo.windowWidth / 750;
					const initialRight = 40 * rpx2px;
					const initialBottom = 40 * rpx2px;

					// 3. 拖动偏移量
					const imageX = this.imageX || 0;
					const imageY = this.imageY || 0;

					// 4. 签名在 crop-image-wrapper 的初始 left/top
					const initialLeft = cropRect.width - cropImageRect.width - initialRight;
					const initialTop = cropRect.height - cropImageRect.height - initialBottom;

					// 5. 拖动后 left/top
					const signLeftInWrapper = initialLeft + imageX;
					const signTopInWrapper = initialTop + imageY;

					// 6. 换算到 canvas 区域
					const canvasSignX = (signLeftInWrapper / cropRect.width) * drawW + offsetX;
					const canvasSignY = (signTopInWrapper / cropRect.height) * drawH + offsetY;

					// 7. 计算签名在canvas中的实际宽高，保持原始宽高比
					// 根据UI显示区域的宽度来计算比例，但保持签名原始宽高比
					const uiSignWidth = cropImageRect.width;
					const scaleRatio = (uiSignWidth / cropRect.width) * drawW / sigW;
					const canvasSignWidth = sigW * scaleRatio;
					const canvasSignHeight = sigH * scaleRatio;

					// 8. 绘制签名
					ctx.drawImage(
						signaturePath,
						canvasSignX,
						canvasSignY,
						canvasSignWidth,
						canvasSignHeight
					);

					ctx.draw(false, () => {
						// 导出为临时路径
						uni.canvasToTempFilePath({
								canvasId: this.canvasId,
								success: async (res) => {
									const tempPath = res?.tempFilePath;
									try {
										const {
											url = ""
										} = await handleUpload(tempPath);
										if (url) {
											callback?.(url);
										}
									} catch (err) {
										console.error("上传失败", err);
									} finally {
										// 清理临时文件，避免占用空间
										try {
											console.log("删除临时文件:");

											uni.getFileSystemManager().unlink({
												filePath: tempPath,
												success: () => {
													console.log("临时文件已删除:", tempPath);
												},
												fail: (err) => {
													console.warn("临时文件删除失败:", err);
												},
											});
										} catch (e) {
											console.warn("unlink 调用异常", e);
										}
										uni.hideLoading();
									}
								},
							},
							this
						);
					});
				} catch (err) {
					console.error(err);
					uni.hideLoading();
					uni.showToast({
						title: "合成失败",
						icon: "none"
					});
				}
			},
			// 下载图片工具（支持本地路径）
			downloadImage(src) {
				if (!src) return;
				return new Promise((resolve, reject) => {
					uni.downloadFile({
						url: src,
						success: (res) => {
							if (res.statusCode === 200) {
								resolve(res.tempFilePath);
							} else {
								reject("图片下载失败");
							}
						},
						fail: reject,
					});
				});
			},
			base64ToFile(base64Data) {
				return new Promise((resolve, reject) => {
					const fileName = `${Date.now()}.png`;
					const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
					const fs = uni.getFileSystemManager();

					const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "");

					const buffer = wx.base64ToArrayBuffer(base64);
					fs.writeFile({
						filePath,
						data: buffer,
						encoding: "binary",
						success: () => resolve(filePath),
						fail: reject,
					});
				});
			},
			handleShowSignature(state) {
				this.$emit("update:isShowSignature", state);
			},
		},
	};
</script>

<style lang="less">
	.image-top {
		display: flex;
		align-items: center;
		justify-content: center;

		.crop-image-wrapper {
			width: 100%;
			max-height: 100%;
			position: relative;
			overflow: hidden;

			.image {
				width: 100vw;
				height: 730rpx;
			}
		}
	}

	.crop-image {
		position: absolute;
		bottom: 40rpx;
		right: 40rpx;
		user-select: none;
		touch-action: none;
		cursor: move;
		z-index: 10;

		.image {
			width: 220rpx;
			height: 146rpx;
		}

		.delete {
			position: absolute;
			top: -40rpx;
			right: -40rpx;
			width: 40rpx;
			height: 40rpx;
			filter: drop-shadow(0 0 4px #010101);
			pointer-events: auto;
			/* 确保删除按钮可以点击 */
		}
	}
</style>
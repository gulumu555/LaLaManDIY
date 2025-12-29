<template>
	<uni-popup ref="popup" :is-mask-click="false" mask-background-color="rgba(0,0,0,0.9)">
		<view class="loading-container">
			<view class="loading-text">
				生成中...{{ Math.floor(displayProgress) }}%，{{loadingTips}}
			</view>
			<view class="loading-cancel">
				<image src="/static/error.svg" @click="handleClose()" class="qrcode-title-cancel" mode="widthFix" />
			</view>
		</view>
	</uni-popup>
</template>

<script>
	export default {
		components: {},
		name: "LoadingOverlay",
		props: {
			loadingTips: {
				type: String,
				default: "可稍后在生图订单中查看",
			},
			visible: {
				type: Boolean,
				default: false,
			},
			duration: {
				type: Number,
				default: 40,
			},
		},
		data() {
			return {
				progress: 0,
				displayProgress: 0, // 用于显示的进度值，带动画效果
				timer: null,
				animationTimer: null
			};
		},
		watch: {
			visible(val) {
				if (val) {
					this.$refs.popup.open("center");
					this.startProgress();
				} else {
					this.$refs.popup.close();
					this.reset();
				}
			},
			progress(newVal, oldVal) {
				// 为进度值变化添加动画效果
				this.animateProgress(oldVal, newVal);
			}
		},
		methods: {
			handleClose() {
				this.$emit("update:visible", false);
			},
			// 数字递增动画效果
			animateProgress(fromVal, toVal) {
				if (this.animationTimer) {
					clearInterval(this.animationTimer);
				}

				const duration = 300; // 动画持续时间300ms
				const steps = 20; // 动画步骤数
				const stepDuration = duration / steps;
				const stepValue = (toVal - fromVal) / steps;

				let currentStep = 0;

				this.animationTimer = setInterval(() => {
					currentStep++;
					if (currentStep <= steps) {
						this.displayProgress = fromVal + (stepValue * currentStep);
					} else {
						this.displayProgress = toVal;
						clearInterval(this.animationTimer);
						this.animationTimer = null;
					}
				}, stepDuration);
			},
			startProgress() {
				this.reset();
				const target = 99;
				const interval = 100; // 每100ms更新一次
				const step = target / ((this.duration * 1000) / interval);

				this.timer = setInterval(() => {
					if (this.progress < target) {
						this.progress = Math.min(this.progress + step, target);
					}
				}, interval);
			},
			complete() {
				return new Promise((resolve) => {
					this.clear();
					this.progress = 100;
					// 延时关闭 popup
					setTimeout(() => {
						this.$emit("update:visible", false);
						this.reset();
						resolve(true);
					}, 1000);
				});
			},
			reset() {
				this.clear();
				setTimeout(() => {
					this.progress = 0;
					this.displayProgress = 0;
				}, 500);
			},
			clear() {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
				if (this.animationTimer) {
					clearInterval(this.animationTimer);
					this.animationTimer = null;
				}
			},
		},
		beforeDestroy() {
			this.clear();
		},
	};
</script>

<style lang="less" scoped>
	.loading-container {
		.loading-text {
			color: #fff;
			text-align: center;
			font-size: 30rpx;
			height: 78rpx;
			line-height: 78rpx;
			border-radius: 78rpx;
			padding: 0 36rpx;
			background-color: #000;
		}

		.loading-cancel {
			margin: 12rpx auto auto;
			width: 60rpx;

			.qrcode-title-cancel {
				width: 60rpx;
				height: 60rpx;
			}
		}
	}
</style>
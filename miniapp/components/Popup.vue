<template>
	<view>
		<view v-if="visible" class="popup-mask" @click="onMaskClick" :style="{ zIndex: maskZIndex }"></view>
		<view v-if="visible" :class="['popup-content', position, { 'popup-open': visible }]" @click.stop
			:style="{ zIndex: contentZIndex }">
			<slot></slot>
		</view>
	</view>
</template>

<script>
export default {
	name: "Popup",
	props: {
		visible: {
			type: Boolean,
			required: true
		},
		position: {
			type: String,
			default: "bottom", // bottom/top/left/right/center
			validator: v => ["bottom", "top", "left", "right", "center"].includes(v)
		},
		closeOnMaskClick: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			maskZIndex: 2000,  // 默认基础值
			contentZIndex: 2001,
			lastTimestamp: Date.now() // 确保初始化
		}
	},
	created() {
		// 双重保障初始化
		if (!this.lastTimestamp) this.lastTimestamp = Date.now();
	},
	emits: ["update:visible", "close"],
	methods: {
		onMaskClick() {
			if (this.closeOnMaskClick) {
				this.$emit("update:visible", false);
				this.$emit("close");
			}
		}
	},
	watch: {
		visible(newVal) {
			if (newVal) {
				let timestamp = Date.now();
				timestamp = Math.max(timestamp, this.lastTimestamp + 1);
				this.lastTimestamp = timestamp;

				// 保证 z-index 递增且安全
				const safeZIndex = 2000 + (timestamp % 1_000_000_000);

				this.maskZIndex = safeZIndex;
				this.contentZIndex = safeZIndex + 1;
			}
		}
	}
}
</script>

<style scoped>
.popup-mask {
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.65);
	transition: opacity 0.3s;
}

.popup-content {
	position: fixed;
	z-index: 1000;
	background: #fff;
	transition: transform 0.3s, opacity 0.3s;
	width: 100vw;
	box-sizing: border-box;
}

.popup-content.bottom {
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 16rpx 16rpx 0 0;
	transform: translateY(100%);
}

.popup-content.top {
	left: 0;
	right: 0;
	top: 0;
	border-radius: 0 0 16rpx 16rpx;
	transform: translateY(-100%);
}

.popup-content.left {
	left: 0;
	top: 0;
	bottom: 0;
	width: 80vw;
	border-radius: 0 16rpx 16rpx 0;
	transform: translateX(-100%);
}

.popup-content.right {
	right: 0;
	top: 0;
	bottom: 0;
	width: 80vw;
	border-radius: 16rpx 0 0 16rpx;
	transform: translateX(100%);
}

.popup-content.center {
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%) scale(0.8);
	border-radius: 16rpx;
	min-width: 60vw;
	min-height: 20vh;
	max-width: 90vw;
	max-height: 80vh;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.18);
}

.popup-content.popup-open.bottom {
	transform: translateY(0);
}

.popup-content.popup-open.top {
	transform: translateY(0);
}

.popup-content.popup-open.left {
	transform: translateX(0);
}

.popup-content.popup-open.right {
	transform: translateX(0);
}

.popup-content.popup-open.center {
	transform: translate(-50%, -50%) scale(1);
}
</style>
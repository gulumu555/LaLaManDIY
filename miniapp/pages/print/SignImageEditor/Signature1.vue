<template>
	<view class="signature-list-item signature-list-item1" :class="className" @click="onClick">
		<view class="item">
			<image src="/static/signature1.svg" class="image" />
			<image src="/static/signature1-white.svg" class="image image-white" />
			<view class="date">{{ formattedDate }}</view>
			<view class="position">
				<view class="char" v-for="(char, i) in arcText" :key="i" :style="`--i: ${i}`">{{ char }}</view>
			</view>
		</view>
	</view>
</template>
<script>
	import dayjs from 'dayjs'
	export default {
		name: 'Signature1',
		props: {
			signatureData: {
				type: Object,
				default: () => ({})
			},
			className: {
				type: String,
				default: ''
			}
		},
		computed: {
			formattedDate() {
				if (!this.signatureData?.date) return '';
				return dayjs(this.signatureData.date).format('YYYYMMDD');
			},
			arcText() {
				return this.signatureData?.location?.street?.split('') || []
			}
		},
		data() {
			return {}
		},

		methods: {
			onClick() {
				this.$emit('onClick');
			}
		},
		watch: {}
	}
</script>

<style lang="less" scoped>
	.signature-list-item1 {
		.image {
			width: 220rpx;
			height: 146rpx;
		}

		.image-white {
			display: none;
		}

		&.active {
			.image {
				display: none;
			}

			.image-white {
				display: block;
			}
		}

		.date {
			position: absolute;
			font-size: 18repx;
			// 切斜30度
			transform: rotate(-22deg);
			top: 67rpx;
			left: 12rpx;
			letter-spacing: -4rpx;
		}

		.position {
			position: absolute;
			width: 200rpx;
			height: 200rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			transform: translate(-36rpx, -74rpx);
			top: 5rpx;

			.char {
				position: absolute;
				left: 50%;
				top: 50%;
				transform-origin: 0 64rpx;
				/* 控制字符离圆心的距离（即弧形半径） */
				transform: rotate(calc(var(--i) * 26deg)) rotate(-63deg);
				/* 每个字符间隔角度 */
				font-size: 18rpx;
			}
		}
	}
</style>
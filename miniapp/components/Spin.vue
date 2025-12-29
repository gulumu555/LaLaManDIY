<template>
	<view class="spin-wrapper">
		<image src="/static/spin.svg" mode="aspectFill" class="spin-icon"
			:style="{width: `${sizeMap[size]}`,height: `${sizeMap[size]}`}"></image>加载中...
	</view>
</template>

<script lang="ts">
	export default {
		name: 'Spin',
		props: {
			size: {
				type: String,
				default: 'default'
			}
		},
		data() {
			return {
				sizeMap: {
					small: '28rpx',
					default: '40rpx',
					large: '64rpx',
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.spin-wrapper {
		display: flex;
		justify-content: center;
		gap: 12rpx;
		color: #333;

		.spin-icon {
			animation: spin 1s linear infinite;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
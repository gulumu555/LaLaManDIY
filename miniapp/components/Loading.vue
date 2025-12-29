<template>
	<view class="empty-wrapper" :style="customStyle">
		<view class="empty-description">{{ tip }}</view>
		<slot></slot>
	</view>
</template>

<script lang="ts">
	export default {
		name: 'Empty',
		props: {
			tip: {
				type: String,
				default: '加载中...'
			},
			image: {
				type: String,
				default: '/static/order.svg' // 建议本地资源或 CDN 图
			},
			customStyle: {
				type: String,
				default: ''
			}
		}
	}
</script>

<style scoped>
	.empty-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 20rpx;
		color: #999;
		font-size: 28rpx;
	}

	.empty-image {
		width: 140rpx;
		margin-bottom: 32rpx;
		opacity: .5;
	}

	.empty-description {
		text-align: center;
		margin-bottom: 16rpx;
		font-size: 32rpx;
	}
</style>
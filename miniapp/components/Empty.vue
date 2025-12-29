<template>
	<view class="empty-wrapper" :style="customStyle">
		<image class="empty-image" :src="image" mode="widthFix" />
		<view class="empty-description">{{ description }}</view>
		<slot></slot>
	</view>
</template>

<script lang="ts">
	export default {
		name: 'Empty',
		props: {
			description: {
				type: String,
				default: '暂无数据'
			},
			image: {
				type: String,
				default: '/static/empty.svg' // 建议本地资源或 CDN 图
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
		width: 423rpx;
		margin-bottom: 32rpx;
		opacity: .5;
	}

	.empty-description {
		text-align: center;
		margin-bottom: 16rpx;
		font-size: 32rpx;
	}
</style>
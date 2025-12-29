<template>
	<view class="card-wrapper" :style="styles">
		<view class="card-header" v-if="title">
			<text class="card-header-title">{{ title }}</text>
			<view class="card-extra">
				<slot name="extra" />
			</view>
		</view>
		<view class="card-body">
			<slot />
		</view>
	</view>
</template>

<script>
export default {
	name: "Card",
	props: {
		title: {
			type: String,
			default: ''
		},
		extra: {
			type: String,
			default: ''
		},
		styles: {
			type: Object,
		}
	}
}
</script>

<style lang="less" scoped>
.card-wrapper {
	border-radius: 16rpx;
	background: #fff;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.card-header-title {}

.card-body {
	padding: 30rpx;
}
</style>
<template>
	<view :style="{ paddingTop: statusBarHeight + 'px' }" class="navbar">
		<view class="back-wrapper" @tap="goBack">
			<image class="back-icon" :src="icon || '/static/back-1.svg'" mode="aspectFit" />{{ iconTitle
			}}
		</view>
		<text class="title">
			<slot></slot>
			{{ title }}
		</text>
	</view>
	<view :style="{ paddingTop: statusBarHeight + 'px' }" class="navbar-seat"></view>
</template>

<script>
export default {
	name: 'Header',
	props: {
		title: {
			type: String,
			default: ''
		},
		icon: {
			type: String,
			default: ''
		},
		iconTitle: {
			type: String,
			default: ''
		},
		showBack: {
			type: Boolean,
			default: true
		},
		back: {
			type: Function,
		}
	},
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight
		}
	},
	methods: {
		goBack() {
			if (this.back) {
				this.back();
			} else {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack();
				} else {
					uni.navigateTo({
						url: '/pages/index/index'
					});
				}
			}
		}
	}
}
</script>

<style lang="less" scoped>
@headerHeight: 78rpx;

.navbar {
	display: flex;
	align-items: center;
	height: @headerHeight;
	padding-left: 20rpx;
	background-color: #fff;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 999;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
	position: fixed;

	.back-wrapper {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-weight: bold;

		.back-icon {
			width: 52rpx;
			height: 52rpx;
		}
	}

	.title {
		width: 100%;
		display: flex;
		justify-content: center;
		gap: 10rpx;
		color: #010101;
		font-size: 32rpx;
		font-weight: bold;

		.arrow-down-icon {
			width: 48rpx;
		}
	}
}

.navbar-seat {
	height: @headerHeight;
}
</style>
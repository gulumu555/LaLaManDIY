<template>
	<view @click="handleOpen(true)">
		<slot></slot>
	</view>
	<Popup :visible="open" @close="() => open = false">
		<view class="qrcode">
			<view class="qrcode-title">
				<view class="qrcode-title-left">
					分销码
				</view>
				<image src="/static/back.svg" @click="handleOpen(false)" class="qrcode-title-cancel" mode="widthFix">
				</image>
			</view>
			<view class="code">
				<image :src="codeUrl" mode="scaleToFill" />
			</view>
			<view class="btn-wrapper">
				<button class="btn-3" open-type="share">
					<image src="/static/share.svg" class="icon" mode="widthFix"></image>分享
				</button>
				<button class="btn-2" @click="handleDownloadAndSaveImage(codeUrl)">
					<image src="/static/download.svg" class="icon" mode="widthFix"></image>保存
				</button>
			</view>
		</view>
	</Popup>
</template>

<script>
import Popup from '@/components/Popup.vue'
import { downloadAndSaveImage } from '@/utils/base'
import { getCode } from '@/utils/user'
export default {
	name: "DistributionQRcode",
	components: {
		Popup
	},
	data() {
		return {
			open: false,
			codeUrl: "",
		};
	},
	mounted() { },
	methods: {
		handleOpen(state) {
			this.open = state
		},
		// 下载并保存图片
		handleDownloadAndSaveImage(url) {
			downloadAndSaveImage(url)
		}
	},
	watch: {
		open: {
			async handler(val) {
				if (val === true) {
					const url = await getCode()
					this.codeUrl = url
				}
			},
			immediate: true
		}
	}
}
</script>

<style lang="less">
.qrcode {
	position: absolute;
	width: 100%;
	background: #FFFFFF;
	box-shadow: 0rpx 4rpx 8rpx 0rpx rgba(0, 0, 0, 0.1);
	border-radius: 16rpx 16rpx 0rpx 0rpx;
	left: 0;
	bottom: 0;

	&-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0 28rpx;
		padding: 26rpx 0;

		&-left {
			font-size: 32rpx;
			font-weight: 500;
		}

		&-cancel {
			width: 40rpx;
		}
	}

	.code {
		margin-top: 86rpx;
		text-align: center;

		image {
			width: 440rpx;
			height: 440rpx;
		}
	}

	.btn-wrapper {
		margin: 70rpx 40rpx 0;
		padding-bottom: 108rpx;
		display: flex;
		justify-content: space-between;

		button {
			width: 45%;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 14rpx;
			font-size: 30rpx;

			.icon {
				width: 40rpx;
			}
		}
	}
}
</style>
<template>
	<view>
		<!-- 其他内容 -->
		<uni-popup ref="privacyPopup" type="dialog">
			<uni-popup-dialog mode="base" title="用户隐私保护指引" content="我们需要获取您的头像和昵称，用于个性化展示。请阅读并同意《隐私政策》"
				@confirm="handleAgreePrivacy" @close="handleRejectPrivacy" />
		</uni-popup>
	</view>
</template>
<script>

export default {
	onLaunch: function () {
		if (!uni.getStorageSync('hasAgreedPrivacy')) {
			this.$refs.privacyPopup?.open?.();
		}
		const systemInfo = uni.getSystemInfoSync()
		uni.$statusBarHeight = systemInfo.statusBarHeight
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	},
	methods: {
		handleAgreePrivacy() {
			uni.setStorageSync('hasAgreedPrivacy', true);
		},
		handleRejectPrivacy() {
			uni.showToast({ title: '需同意隐私政策才能使用', icon: 'none' });
		}
	}
}
</script>

<style lang="less">
@import './style.less';
</style>
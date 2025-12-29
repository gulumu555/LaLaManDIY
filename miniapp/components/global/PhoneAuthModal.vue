<template>
	<view v-if="visible" class="auth-modal">
		<button open-type="getPhoneNumber" @getphonenumber="handleGetPhoneNumber" class="btn-phone">
			授权手机号登录
		</button>
	</view>
</template>

<script>
	import {
		loginGetPhoneNumber
	} from '@/utils/user'
	export default {
		name: 'PhoneAuthModal',
		data() {
			return {
				visible: false,
				callback: null
			}
		},
		created() {
			console.log('📢 PhoneAuthModal 已挂载')
			uni.$on('showPhoneAuthModal', this.showModal)
		},
		beforeDestroy() {
			uni.$off('showPhoneAuthModal', this.showModal)
		},
		methods: {
			showModal(cb) {
				this.visible = true
				this.callback = cb
			},
			async handleGetPhoneNumber(e) {
				if (e.detail.errMsg !== 'getPhoneNumber:ok') {
					uni.showToast({
						title: '授权失败',
						icon: 'none'
					})
					return
				}
				this.callback(e)
				return
				await loginGetPhoneNumber(e.detail.code)
			}
		}
	}
</script>
<style lang="less">
	.auth-modal {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.btn-phone {
		margin-top: 40vh;
		width: 80%;
		margin-left: 10%;
	}
</style>
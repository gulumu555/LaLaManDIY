<template>
	<Header :title="title" />
	<rich-text :nodes="content" class="info" />
</template>

<script>
	import Header from '@/components/Header.vue'
	import apiUser from '@/api/user'
	export default {
		components: {
			Header
		},
		data() {
			return {
				title: '',
				content: '',
				titleConfig: {
					user_agreement: '用户协议',
					payment_agreement: '支付服务协议',
					privacy_agreement: '隐私协议',
					withdrawal_instruction: '提现说明',
				},
				type: ''
			};
		},
		onLoad(options) {
			this.requestAgreement(options)
		},
		methods: {
			async requestAgreement(options) {
				const {
					type
				} = options
				this.title = this.titleConfig?.[type] || ''
				console.log('this.title', this.title);
				apiUser.agreement().then(res => {
					this.content = res?.data?.[type] || ''
				})
				this.type = type;
			}
		}
	}
</script>

<style lang="less" scoped>
	.info {
		color: #65667D;
		line-height: 1.6;
		margin: 30rpx 40rpx;
		display: block;
	}
</style>
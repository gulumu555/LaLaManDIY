<template>
	<Address headerTitle="收货地址" @onClose="handleClose" />
</template>

<script>
import Header from '@/components/Header.vue'
import Address from '@/components/Address.vue'
export default {
	components: {
		Header,
		Address
	},
	data() {
		return {
		};
	},
	onLoad() {
	},
	methods: {
		handleClose() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="less" scoped></style>
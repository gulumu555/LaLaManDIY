<template>
	<view class="all-photo" v-if="open">
		<Header :back="goBack" icon="/static/back.svg">
			全部图片
			<image class="arrow-down-icon" src="/static/arrow-down-linear.svg" />
		</Header>
		<image class="image-top" :src="chooseImageUrl" mode="widthFix"></image>
		<view class="all-photo-list">
			<image v-for="item in data" class="image-list" :src="item" @click="handleChooseImage(item)"
				mode="aspectFit">
			</image>
		</view>
		<view class="footer-float-wrapper">
			<button class="btn-1" @click="goNext()">下一步</button>
		</view>
	</view>
</template>

<script lang="ts">
import Header from '@/components/Header.vue'
export default {
	name: 'ChooseImage',
	components: {
		Header
	},
	props: {
		data: {
			type: Array,
			default: [],
		},
		open: {
			type: Boolean,
			default: false,
		},
		headerBack: {
			type: Function
		}
	},
	data() {
		return {
			statusBarHeight: uni.$statusBarHeight,
			chooseImageUrl: ''
		};
	},
	methods: {
		goBack() {
			this.headerBack()
		},
		goNext() {
			uni.navigateTo({
				url: '/pages/styleTransfer/index'
			})
		},
		handleChooseImage(url) {
			this.chooseImageUrl = url
		}
	},
	watch: {
		data: {
			handler(newVal) {
				this.chooseImageUrl = newVal?.[0] || ''
			}
		}
	}
}
</script>

<style lang="less" scoped>
.all-photo {
	position: fixed;
	inset: 0;
	background-color: #fff;
	z-index: 3;

	.image-top {
		width: 100%;
	}

	&-list {
		display: flex;
		flex-wrap: wrap;
		gap: 2vw;

		.image-list {
			width: 32vw;
			height: 32vw;
			background-color: #eee;
		}
	}
}
</style>
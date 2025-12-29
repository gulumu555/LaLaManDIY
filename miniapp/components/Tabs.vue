<template>
	<view class="scroll-mask-x">
		<scroll-view scroll-x :scroll-with-animation="true" :show-scrollbar="false" class="scroll-x-hidden">
			<view :class="['tabs-wrapper', 'scroll-content', className]">
				<view v-for="(tab, index) in tabs" :key="index" class="tab-item"
					:class="{ active: activeKey === index, disabled: disabled }" @tap="onTabClick(index)">
					{{ tab.label }}
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: 'Tabs',
	props: {
		tabs: {
			type: Array,
			required: true,
			default: () => []
		},
		modelValue: {
			type: Number,
			default: ''
		},
		className: {
			type: String,
			default: ''
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			currentIndex: this.modelValue || 0,
		}
	},
	computed: {
		activeKey: {
			get() {
				return this.modelValue
			},
			set(val) {
				this.$emit('update:modelValue', val)
			}
		}
	},
	methods: {
		onTabClick(index) {
			if (index !== this.currentIndex && !this.disabled) {
				this.currentIndex = index
				this.$emit('onChange', index)
			}
		}
	}
}
</script>

<style lang="less" scoped>
.tabs-wrapper {
	min-width: 100%;
	gap: 68rpx;
	background-color: #fff;
	padding: 0 32rpx;
	box-sizing: border-box;

	&.flex-1 {
		.tab-item {
			flex: 1;
		}
	}

	&.no-line {
		padding: 0;

		.tab-item {
			&::after {
				content: none;
			}
		}
	}

	&.font36 {
		.tab-item {
			font-size: 36rpx;
		}
	}
}

.tab-item {
	text-align: center;
	padding: 0 6rpx;
	font-size: 28rpx;
	color: #C9C9C9;
	line-height: 120rpx;
}

.tab-item.active {
	color: #000;
	font-weight: bold;
	position: relative;

	&::after {
		content: '';
		width: 70rpx;
		height: 12rpx;
		border-radius: 12rpx;
		background-color: #010101;
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-35rpx);
	}
}

.tab-item.disabled {
	color: #C9C9C9;
}
</style>
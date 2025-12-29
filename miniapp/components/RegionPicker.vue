<template>
	<view>
		<view class="region-picker-trigger" @click="visible = true">
			{{ displayText }}
		</view>
		<Popup :visible="visible" @update:visible="onPopupVisible">
			<view class="region-picker-popup">
				<view class="region-picker-header">请选择省市区</view>
				<view class="region-picker-selectors">
					<picker-view style="height: 500rpx;" :indicator-style="'height: 38px;'" :value="rangeValues"
						@change="onPickerViewChange">
						<picker-view-column>
							<view v-for="item in regions[0]" :key="item.value" class="picker-item">{{ item.text }}
							</view>
						</picker-view-column>
						<picker-view-column>
							<view v-for="item in regions[1]" :key="item.value" class="picker-item">{{ item.text }}
							</view>
						</picker-view-column>
						<picker-view-column>
							<view v-for="item in regions[2]" :key="item.value" class="picker-item">{{ item.text }}
							</view>
						</picker-view-column>
					</picker-view>
				</view>
				<view class="region-picker-actions">
					<button @click="onCancel">取消</button>
					<button type="primary" @click="onConfirm">确定</button>
				</view>
			</view>
		</Popup>
	</view>
</template>

<script setup>
import Popup from '@/components/Popup.vue'
import { ref, reactive, watch, onMounted, computed } from 'vue'
import apiUser from '@/api/user'

const props = defineProps({
	modelValue: Object
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const initItem = { value: 0, text: '请选择' }
const regions = reactive([[initItem], [initItem], [initItem]])
const rangeValues = ref([0, 0, 0])
const originRegions = reactive({})

const selected = reactive({
	province: 0,
	city: 0,
	county: 0
})

const displayText = computed(() => {
	if (!props.modelValue || !props.modelValue.provinceText) return '请选择地区'
	return [props.modelValue.provinceText, props.modelValue.cityText, props.modelValue.countyText].join(' / ')
})

const onPopupVisible = (val) => {
	visible.value = val
}

const onCancel = () => {
	visible.value = false
}

const onConfirm = () => {
	if (rangeValues.value.some(val => val === 0)) {
		uni.showToast({ title: '请完整选择省市区', icon: 'none' })
		return
	}
	selected.province = regions[0][rangeValues.value[0]].value
	selected.city = regions[1][rangeValues.value[1]].value
	selected.county = regions[2][rangeValues.value[2]].value
	emit('update:modelValue', {
		...selected,
		provinceText: regions[0][rangeValues.value[0]].text,
		cityText: regions[1][rangeValues.value[1]].text,
		countyText: regions[2][rangeValues.value[2]].text
	})
	visible.value = false
}

const lastRangeValues = ref([0, 0, 0])

const onPickerViewChange = async (e) => {
	const values = e.detail.value
	// 找出变动的列
	let changedCol = 0
	for (let i = 0; i < values.length; i++) {
		if (values[i] !== lastRangeValues.value[i]) {
			changedCol = i
			break
		}
	}
	rangeValues.value = [...values]
	lastRangeValues.value = [...values]

	// 重置下一级及后续
	for (let i = changedCol + 1; i < 3; i++) {
		rangeValues.value[i] = 0
		regions[i] = [initItem]
	}

	// 懒加载下一级
	if (changedCol < 2) {
		const curItem = regions[changedCol][values[changedCol]]
		if (curItem && curItem.value) {
			await handleGetRegion(changedCol, curItem.value)
		}
	}
}

const handleGetRegion = async (column, id) => {
	const nextCol = column + 1
	if (originRegions[id]) {
		regions[nextCol] = [initItem, ...originRegions[id]]
		return
	}
	try {
		const res = await apiUser.getRegion({ id })
		const options = res.data.map(({ id, title }) => ({
			value: id,
			text: title
		}))
		originRegions[id] = options
		regions[nextCol] = [initItem, ...options]
	} catch (e) {
		console.error('获取地区失败', e)
	}
}

onMounted(async () => {
	await handleGetRegion(-1, 0)
})

// 如果外部传入了 modelValue，自动回显
watch(
	() => props.modelValue,
	(val) => {
		if (val && val.province && val.city && val.county) {
			// 查找下标
			const findIndex = (arr, v) => arr.findIndex(i => i.value === v)
			rangeValues.value[0] = findIndex(regions[0], val.province)
			if (rangeValues.value[0] > 0) handleGetRegion(0, val.province)
			rangeValues.value[1] = findIndex(regions[1], val.city)
			if (rangeValues.value[1] > 0) handleGetRegion(1, val.city)
			rangeValues.value[2] = findIndex(regions[2], val.county)
		}
	},
	{ immediate: true }
)
</script>

<style scoped>
.region-picker-trigger {
	padding: 12rpx 20rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
	color: #333;
	min-width: 200rpx;
}

.region-picker-popup {
	padding: 32rpx;
	background: #fff;
	border-radius: 16rpx 16rpx 0 0;
}

.region-picker-header {
	font-weight: bold;
	text-align: center;
	margin-bottom: 24rpx;
}

.region-picker-selectors {
	height: 600rpx;
	margin-bottom: 24rpx;
}

.picker-item {
	height: 38px;
	line-height: 38px;
	text-align: center;
}

.region-picker-actions {
	display: flex;
	justify-content: space-between;
	gap: 24rpx;
}
</style>
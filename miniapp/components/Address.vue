<template>
	<view class="address-wrapper">
		<Header :title="headerTitle" :back="handleback"></Header>
		<InfiniteList :fetchFn="requestUserAddress" ref="infiniteList"
			:styles="{ height: 'calc(100vh - 47px - 340rpx)' }">
			<template #default="{ item }">
				<view class="card" :class="{ 'selected': item?.id === selectedAddress?.id }"
					@click="handleOnSelect(item)">
					<view class="card-1">
						{{ item?.name }}&nbsp;&nbsp;&nbsp;{{ item?.phone }}
					</view>
					<view class="card-2">
						{{ item?.pid_path_title }} {{ item?.address }}
					</view>
					<view class="card-3">
						<view class="card-3-1" @click.stop>
							<switch :checked="item?.is_default === 1" @change="handleDefault(item)" color="#3C3D3E"
								style="transform:scale(0.8);transform-origin: left center;pointer-events: auto;" />
							<text catchtap>默认</text>
						</view>
						<view class="card-3-2">
							<view class="btn-edit" @click.stop="handleUpdate(item)">编辑</view>
							<view class="btn-edit" @click.stop="handleDeleteAddress(item?.id)">删除</view>
						</view>
					</view>
				</view>
			</template>
		</InfiniteList>
	</view>
	<view class="bottom-btn-wrapper-fixed">
		<button class="btn-3" @click="handleUpdate({})">新增地址</button>
	</view>

	<Popup :visible="visible" @close="showPopup(false)">
		<view class="editAddress-wrapper">
			<Header title="编辑地址" :back="() => visible = false" />
			<view class="c edit-list">
				<Card>
					<view class="t-1">
						<view class="t-1-1">
							收货人姓名
						</view>
						<view class="t-1-2">
							<input type="text" v-model="formData.name" placeholder="请输入收货人姓名" class="input-text" />
						</view>
					</view>
					<view class="t-1">
						<view class="t-1-1">
							手机号码
						</view>
						<view class="t-1-2">
							<input type="text" v-model="formData.phone" placeholder="请输入手机号码" class="input-text" />
						</view>
					</view>
					<view class="t-1">
						<view class="t-1-1">
							所在地
						</view>
						<view class="t-1-2">
							<RegionPicker v-model="region" />
						</view>
					</view>
					<view class="t-2" style="border-bottom: none;padding-bottom: 0;">
						<view class="t-2-1">
							详细地址
						</view>
						<view class="t-2-2">
							<textarea v-model="formData.address" placeholder="请输入详细地址"
								class="input-textarea"></textarea>
						</view>
					</view>
					<view class="t-1" style="border-bottom: none;">
						<view class="t-1-1">
							设为默认地址
						</view>
						<view class="t-1-2">
							<switch color="#3C3D3E" :checked="formData.is_default"
								@change="(e) => formData.is_default = e.detail.value ? 1 : 0" />
						</view>
					</view>
					<view class="bottom-btn-wrapper">
						<button class="btn-3" @click="submitForm">保存地址</button>
					</view>
				</Card>
			</view>
		</view>
	</Popup>
</template>

<script>
import InfiniteList from '@/components/InfiniteList.vue'
import Popup from '@/components/Popup.vue'
import Header from '@/components/Header.vue'
import Card from '@/components/Card.vue'
import RegionPicker from '@/components/RegionPicker.vue'
import apiUser from '@/api/user'
export default {
	name: "Address",
	components: {
		InfiniteList,
		Popup,
		Header,
		Card,
		RegionPicker
	},
	props: {
		onDataLoad: {
			type: Function,
			default: () => { }
		},
		onSelect: {
			type: Function,
			default: () => { }
		},
		selectedAddress: {
			type: Object,
			default: () => { }
		},
		mode: {
			type: String,
			default: 'list'
		},
		headerTitle: {
			type: String,
			default: '选择收货地址'
		}
	},
	data() {
		return {
			visible: false,
			formData: {
				name: '',
				phone: null,
				province: 0,
				city: 0,
				county: 0,
				address: '',
				is_default: 0
			},
			editAddress: null,
			region: null,
			isFirstLoad: true
		};
	},
	mounted() { },
	methods: {
		async requestUserAddress() {
			const res = await apiUser.userAddress()
			if (this.isFirstLoad) {
				this.onDataLoad?.(res?.data?.data || [])
				this.isFirstLoad = false
			}
			return res
		},
		showPopup(state) {
			if (!state) {
				this.editAddress = null
			}
			this.visible = state
		},
		submitForm() {
			const _formData = {
				...this.formData,
				is_default: this.formData?.is_default ? 1 : 0,
			}
			if (this.editAddress.id) {
				this.handleUpdateForm(_formData)
				return
			}
			apiUser.createAddress(_formData).then(res => {
				this.updateSuccess()
			})
		},
		handleUpdate(item) {
			this.editAddress = item
			this.formData = item
			this.visible = true
		},
		handleDefault(item) {
			this.handleUpdateForm({
				...item,
				is_default: item.is_default ? 0 : 1
			})
		},
		handleUpdateForm(data) {
			apiUser.updateAddress(data || this.formData).then(res => {
				this.updateSuccess()
			})
		},
		updateSuccess() {
			uni.showToast({
				icon: 'success',
				title: '操作成功',
				duration: 2000,
				complete: () => {
					this.visible = false
					this.$refs.infiniteList.refresh()
				}
			})
		},
		handleDeleteAddress(id) {
			const _this = this
			uni.showModal({
				title: '删除确认',
				content: '是否删除这个地址？',
				success: function (res) {
					if (res.confirm) {
						apiUser.deleteAddress({
							id
						}).then(res => {
							_this.updateSuccess()
						})
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			})
		},
		handleOnSelect(item) {
			if (this.mode !== 'selector') return
			this.onSelect(item)
		},
		handleback() {
			this.$emit('onClose')
		}
	},
	watch: {
		visible(newVal) {
			const {
				province,
				city,
				county,
				pid_path_title
			} = this.editAddress
			const [provinceText, cityText, countyText] = pid_path_title.split('-')
			this.region = {
				province,
				city,
				county,
				provinceText,
				cityText,
				countyText
			}
		},
		region(newVal) {
			const {
				province,
				city,
				county
			} = newVal
			this.formData.province = province
			this.formData.city = city
			this.formData.county = county
		},
	}
}
</script>

<style lang="less" scoped>
.address-wrapper {
	height: 100vh;
	background-color: #F8F8F8;

	.card {
		margin: 20rpx 30rpx auto;

		&.selected {
			border: 1px solid #010101;
		}

		&-1 {
			margin: 0 30rpx;
		}

		&-2 {
			color: #666666;
			margin-top: 12rpx;
			border-bottom: 2rpx solid #EEEEEE;
			padding: 0 30rpx 26rpx;
			box-sizing: border-box;
		}

		&-3 {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin: 0 30rpx;
			margin-top: 28rpx;

			&-1 {
				color: #999;
			}

			&-2 {
				display: flex;
				gap: 80rpx;
			}
		}
	}
}

.editAddress-wrapper {
	height: 100vh;
	background: #F8F8F8;

	.edit-list {
		margin-top: 20px;

		.t-1,
		.t-2 {
			padding: 32rpx 0;
			margin: 0 30rpx;
			box-sizing: border-box;
			border-bottom: 2rpx solid #F4F4F4;

			&-1 {
				font-weight: bold;
			}
		}

		.t-1 {
			display: flex;
			justify-content: space-between;
			align-items: center;

			&-2 {
				.input-text {
					text-align: right;
				}
			}
		}

		.t-2 {
			&-2 {
				.input-textarea {
					border: 2rpx solid #F4F4F4;
					border-radius: 8rpx 8rpx 8rpx 8rpx;
					height: 168rpx;
					padding: 32rpx;
					box-sizing: border-box;
					width: 100%;
					margin-top: 20rpx;
				}
			}
		}
	}
}
</style>
<template>
	<Popup :visible="visible" position="bottom">
		<view class="apply-sales" v-if="visible">
			<Header :back="handleClose">申请售后</Header>
			<view class="c">
				<view style="margin-top: 20rpx;">
					<OrderDetail :record="order" :displayRange="[1]" />
				</view>
				<Card :styles="{ marginTop: '20rpx' }">
					<view class="list-label"><label>*</label>申请退款金额</view>
					<input type="text" v-model="safeFormData.refund_amount" class="list-text" placeholder="请输入退款金额">
					<view class="list-label"><label>*</label>退款原因</view>
					<textarea v-model="safeFormData.reason" class="list-text list-textarea"
						placeholder="请输入退款原因"></textarea>
					<view class="list-label"><label>*</label>上传凭证</view>
					<Upload v-model:value="myFileList"></Upload>
				</Card>
			</view>
			<view class="bottom-btn-wrapper-fixed">
				<button class="btn-3" @click="handleSubmit">提交申请</button>
			</view>
		</view>
	</Popup>
</template>

<script>
import Popup from '@/components/Popup.vue'
import Header from '@/components/Header.vue'
import Card from '@/components/Card.vue'
import OrderDetail from '@/components/OrderDetail.vue'
import Upload from '@/components/Upload.vue'
import apiRecharge from '@/api/recharge'
export default {
	name: "ApplySales",
	components: {
		Popup,
		Header,
		Card,
		OrderDetail,
		Upload
	},
	props: {
		order: {
			type: Object,
			default: () => { }
		},
		visible: {
			type: Boolean,
			default: false
		},
		formData: {
			type: Object,
			default: () => {
				return {
					refund_amount: '',
					reason: '',
					file: []
				}
			}
		}
	},
	data() {
		return {
			myFileList: [],
		};
	},
	computed: {
		safeFormData() {
			return {
				...(this.formData || {
					refund_reason: '',
					file: []
				}),
				refund_amount: this?.order?.total_amount || '0.00',
			}
		}
	},
	methods: {
		handleClose() {
			this.$emit('close');
		},
		handleSubmit() {
			// formData 校验
			if (!this.safeFormData.refund_amount) {
				uni.showToast({
					title: '请填写退款金额',
					icon: 'none'
				});
				return;
			}
			// 只允许输入正数（含小数点）
			if (!/^\d+(\.\d+)?$/.test(this.safeFormData.refund_amount)) {
				uni.showToast({
					title: '退款金额只能输入数字',
					icon: 'none'
				});
				return;
			}

			if (!this.safeFormData.reason) {
				uni.showToast({
					title: '请填写退款原因',
					icon: 'none'
				});
				return;
			}
			if (!this.myFileList.length) {
				uni.showToast({
					title: '请上传凭证',
					icon: 'none'
				});
				return;
			}
			apiRecharge.applyAfterSale({ ...this.safeFormData, id: this.order.id, file: this.myFileList }).then(res => {
				uni.showToast({
					title: '申请成功',
					icon: 'success'
				});
				this.$emit('close');
				this.$emit('refresh');
			})
		}
	},
	watch: {
		visible(newVal) {
			if (newVal) {
				// 重置表单
				// this.myFileList = [];
				// this.safeFormData = {
				// 	...this.formData,
				// 	refund_amount: this.order.total_amount || '0.00'
				// }
			}
		}
	}
}
</script>

<style lang="less" scoped>
.apply-sales {
	height: 100vh;
	background-color: #F8F8F8;
}


.list-label {
	margin-top: 32rpx;
	margin-bottom: 34rpx;

	&:first-child {
		margin-top: 0;
	}

	label {
		color: #FF5722;
		padding-right: 8rpx;
	}
}

.list-text {
	border-bottom: 1px solid #F4F4F4;
	height: 84rpx;
	padding: 0 32rpx;
}

.list-textarea {
	box-sizing: border-box;
	height: 168rpx;
	border: 1px solid #F4F4F4;
	border-radius: 8rpx;
	padding: 12rpx 30rpx;
}
</style>
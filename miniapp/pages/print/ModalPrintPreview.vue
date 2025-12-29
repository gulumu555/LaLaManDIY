<template>
	<Popup :visible="visible" :closeOnMaskClick="true">
		<view class="modal-print-preview">
			<Header :title="'预览'" :back="back" />
			<view class="image-wrapper">
				<SignImageEditor ref="signImageEditor" :signatureData="signatureData" :src="joinParams.original_img"
					:currentProductSpec="currentProductSpec" :selectedIndex="selectedIndex"
					:originImageSize="originImageSize" @load="onImageLoad" v-model:isShowSignature="isShowSignature" />
			</view>

			<view class="c">
				<Tabs :tabs="tabItems" v-model="activeKey" @onChange="(key) => (activeKey = key)" className="no-line" />
				<view class="spec-list" v-if="activeKey === 0">
					<view class="spec-list-item" :class="{ active: currentProductSpec?.id === item?.id }"
						v-for="item in productSpecList" :key="item.id" @click="onChangeProductSpec(item)">
						<view class="spec-list-item-text">
							<view>
								{{ item?.spec_name }}
							</view>
							<view v-if="item?.accuracy_width">
								{{ item?.accuracy_width }}*{{ item?.accuracy_height }}px
							</view>
						</view>
					</view>

					<button open-type="contact" class="clean-button">
						<view class="spec-list-item">
							<view class="spec-list-item-text">联系客服</view>
						</view>
					</button>
				</view>

				<view class="signature-list" v-if="activeKey === 1">
					<Signature1 :signatureData="signatureData" :className="{ active: selectedIndex === 0 }"
						@onClick="handleChangeSignature(0)" />
					<Signature2 :signatureData="signatureData" :className="{ active: selectedIndex === 1 }"
						@onClick="handleChangeSignature(1)" />
					<Signature3 :signatureData="signatureData" :className="{ active: selectedIndex === 2 }"
						@onClick="handleChangeSignature(2)" />
					<Signature4 :signatureData="signatureData" :className="{ active: selectedIndex === 3 }"
						@onClick="handleChangeSignature(3)" />
				</view>
			</view>

			<view class="bottom-btn-wrapper">
				<button class="btn-3" @click="handleSubmit()">购买</button>
			</view>
		</view>
	</Popup>
	<MyCustomModal :visible="modalVisible" @close="handleAction" @reSelect="handleReSelect" :params="joinParams"
		:callbacks="callbacks" />
</template>

<script>
	import _ from "lodash";
	import dayjs from "dayjs";
	import Header from "@/components/Header.vue";
	import Tabs from "@/components/Tabs.vue";
	import MyCustomModal from "@/components/MyCustomModal.vue";
	import SignImageEditor from "./SignImageEditor/index.vue";

	import apiPrint from "@/api/print";
	import apiUser from "@/api/user";
	import {
		chooseAndUploadImage,
		handleUpload
	} from "@/utils/upload";
	import Popup from "@/components/Popup.vue";

	import Signature1 from "./SignImageEditor/Signature1.vue";
	import Signature2 from "./SignImageEditor/Signature2.vue";
	import Signature3 from "./SignImageEditor/Signature3.vue";
	import Signature4 from "./SignImageEditor/Signature4.vue";

	export default {
		name: "ModalPrintPreview",
		components: {
			Header,
			Tabs,
			Signature1,
			Signature2,
			Signature3,
			Signature4,
			Popup,
			MyCustomModal,
			SignImageEditor,
		},
		setup() {
			return {};
		},
		props: {
			params: {},
			visible: {
				type: Boolean,
				default: false,
			},
			back: {
				type: Function,
				default: () => {},
			},
			onSubmit: {
				type: Function,
				default: () => {},
			},
		},
		watch: {
			activeKey(val) {
				if (Number(val) === 1) {
					this.isShowSignature = true;
					this.getLocation();
				}
			},
			params(val) {
				val.id && this.requestProductSpecList(val.id);
				if (val?.url) {
					this.joinParams.original_img = this.params?.url
				}
			}
		},
		data() {
			return {
				joinParams: {},
				productSpecList: [],
				currentProductSpec: null,
				preProductSpec: null,
				clickProductSpec: null,
				tabItems: [{
						label: "尺寸",
					},
					// {
					// 	label: "签名",
					// },
				],
				item: {
					type: Object,
					required: true,
				},
				activeKey: 0,
				selectedIndex: -1,
				originImageSize: {
					width: 0,
					height: 0,
				},
				modalVisible: false,
				// 定位市 街道
				signatureData: {
					location: {
						city: "",
						street: "",
					},
				},
				callbacks: {},
				isShowSignature: false,
			};
		},
		mounted() {
			this.selectedIndex = 0;
			this.joinParams = {
				...(this.params || {}),
				original_img: this.params?.url,
			};

			this.requestProductSpecList(this.joinParams.id);
			this.callbacks = {
				onSuccess: (data) => {
					this.joinParams.original_img = data.ai_original_img;
					this.modalVisible = false;
					this.currentProductSpec = this.preProductSpec;
				},
			};
		},
		methods: {
			onImageLoad(e) {
				this.originImageSize = e.detail;
			},
			requestProductSpecList(product_id) {
				if (!product_id) return;
				apiPrint.productSpecList({
					product_id
				}).then((res) => {
					this.productSpecList = res?.data?.data || [];
				});
			},
			async onChangeProductSpec(item) {
				// 判断是否增强
				// const checkRes = await this.checkSize(item);
				const checkRes = true
				const {
					product_name,
					id: product_id,
					url: original_img
				} = this.params || {};
				const {
					accuracy_width: width,
					accuracy_height: height
				} = item || {};
				const is_strength = 1;
				if (!checkRes) {
					this.preProductSpec = item;
					this.joinParams = {
						name: `${product_name}-精度增强`,
						original_img,
						photo_style_id: 0,
						product_id,
						order_type: 2,
						is_strength,
						width,
						height,
					};
					this.modalVisible = true;
				} else {
					this.currentProductSpec = item;
				}
			},
			// 检查尺寸是否合法
			async checkSize(image) {
				const {
					width = 0, height = 0
				} = this.originImageSize || {};
				const {
					accuracy_width,
					accuracy_height
				} = image;
				return width >= accuracy_width && height >= accuracy_height;
			},
			// 获取定位信息
			async getLocation() {
				if (this?.signatureData?.location?.city) return;
				const _this = this;
				uni.getLocation({
					type: "gcj02", // 腾讯/高德坐标系
					success: (res) => {
						const {
							latitude,
							longitude
						} = res;
						_this.getLocationInfo(latitude, longitude);
					},
					fail(err) {
						// 开发模式下，默认坐标
						_this.getLocationInfo(30.572815, 104.066803);
						uni.showToast({
							title: "定位失败，请检查权限",
							icon: "none",
						});
					},
				});
			},
			async getLocationInfo(latitude, longitude) {
				const res = await apiUser.getLocation(latitude, longitude);
				const {
					address_component,
					address_reference
				} = res?.data || {};
				this.signatureData = {
					location: {
						city: address_component?.city || "",
						street: address_reference?.street?.title || "",
					},
					date: res?.time * 1000,
				};
			},
			handleAction(index) {
				this.modalVisible = false;
			},
			handleReSelect() {
				chooseAndUploadImage({
					callbacks: {
						onSuccess: (url) => {
							this.joinParams.original_img = url;
							this.modalVisible = false;
							this.$emit("onReSelectImage", url);
						},
					},
				});
			},
			handleSubmit(data) {
				if (!this.currentProductSpec) {
					uni.showToast({
						title: "请选择尺寸",
						icon: "none",
					});
					return;
				}

				if (this.isShowSignature) {
					this.$refs.signImageEditor.handleGenerateSignature({
						callback: (url) => {
							this.joinParams.original_img = url;
							this.onSubmit({
								spec: this.currentProductSpec,
								url
							});
						},
					});
					return;
				}
				this.onSubmit({
					spec: this.currentProductSpec
				});
			},
			handleChangeSignature(index) {
				this.selectedIndex = index
				this.isShowSignature = true
			}
		},
	};
</script>

<style lang="less">
	.modal-print-preview {
		height: 100vh;

		.image-wrapper {
			position: relative;
			overflow: hidden;

			.image-top {
				display: flex;
				align-items: center;
				justify-content: center;

				.crop-image-wrapper {
					width: 100%;
					max-height: 100%;
					position: relative;
					overflow: hidden;

					.image {
						width: 100%;
						display: block;
					}
				}
			}

			.crop-image {
				position: absolute;
				bottom: 40rpx;
				right: 40rpx;

				.image {
					width: 220rpx;
					height: 146rpx;
				}

				.delete {
					position: absolute;
					top: 4rpx;
					right: 4rpx;
					width: 40rpx;
					height: 40rpx;
					filter: drop-shadow(0 0 4px #010101);
				}
			}
		}

		.spec-list {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20rpx;

			&-item {
				display: flex;
				justify-content: center;
				align-items: center;
				border: 2rpx solid #010101;
				border-radius: 16rpx;
				background-color: #fff;
				line-height: 40rpx;
				height: 108rpx;
				font-size: 24rpx;

				&.active {
					background-color: #010101;
					color: #fff;
				}

				&-text {
					text-align: center;
				}
			}
		}
	}
</style>
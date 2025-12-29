<template>
	<view @click="handleCreateStyleTransferOrder()">
		<slot></slot>
	</view>
	<LoadingOverlay ref="loadingOverlay" v-model:visible="loading" :duration="createDuration"
		:loadingTips="loadingTips" />
	<ModalRecharge ref="modalRecharge" :onSuccess="handlePaymentSuccess" />
</template>

<script>
	import LoadingOverlay from "@/components/LoadingOverlay.vue";
	import ModalRecharge from "@/components/ModalRecharge.vue";
	import {
		isNetworkImage,
		handleUpload
	} from "@/utils/upload";
	import apiPrint from "@/api/print";
	export default {
		name: "Create",
		components: {
			LoadingOverlay,
			ModalRecharge,
		},
		props: {
			params: {
				type: Object,
				default: () => ({}),
			},
			regenerate: {
				type: Boolean,
				default: false,
			},
			callbacks: {
				type: Object,
				default: () => ({}),
			},
			loadingTips: {
				type: String,
			},
			tips: {
				type: String,
				default: "重新生成会消耗次数1次，确认需要重新生成一版？",
			},
			createDuration: {
				type: Number,
				default: 40,
			}
		},
		data() {
			return {
				loadingTips: this.loadingTips,
				params: this.params,
				loading: false,
				pollTimer: null,
			};
		},
		methods: {
			handlePaymentSuccess() {
				this.$refs.modalRecharge.handleSwitch(true);
			},
			async handleCreateStyleTransferOrder(data, callbacks) {
				const _this = this;
				const params = data || _this.params;
				const run = async () => {};
				if (this.regenerate) {
					uni.showModal({
						title: "提示",
						content: this.tips,
						success: (res) => {
							if (res.confirm) {
								_this.createStyleTransferOrder(params, callbacks);
							}
						},
					});
				} else {
					_this.createStyleTransferOrder(params, callbacks);
				}
			},
			async createStyleTransferOrder(params, callbacks) {
				const res = await handleUpload(params?.original_img);
				this.params.original_img = res.url;
				params.original_img = res.url;
				// is_strength=1时，name需要拼接-精度增强，如果name中已经以-精度增强结尾，则不拼接
				if (params?.is_strength === 1) {
					if (!params.name.endsWith("-精度增强")) {
						params.name = `${params.name}-精度增强`;
					}
				}
				const createRes = await apiPrint.create(params);
				if (createRes.code === -3) {
					uni.showToast({
						title: createRes.message,
						icon: "none",
					});
					this.$refs.modalRecharge.handleSwitch(true);
					return;
				}

				if (!createRes?.data?.id) {
					this.callbacks?.onFail?.();
					return;
				}
				this.pollStyleTransferStatus(createRes?.data?.id, callbacks);
			},
			pollStyleTransferStatus(styleTransferId, callbacks) {
				this.loading = true;
				const _this = this;
				const checkStatus = async () => {
					if (typeof styleTransferId !== "number" || isNaN(styleTransferId)) {
						return;
					}
					try {
						apiPrint.findPhotoOrder(styleTransferId).then(async (res) => {
							// 开发环境模拟数据
							// if (process.env.NODE_ENV === 'development') {
							// 	res.data.ai_original_img =
							// 		'https:\/\/lalaman.tos-cn-beijing.volces.com\/upload\/20250902\/3d_model_732_1354391451022516224.png'
							// }
							const {
								ai_original_img,
								status,
								status_text = ''
							} = res?.data || {};
							if (status === 3) {
								uni.showModal({
									title: '',
									content: status_text,
									showCancel: false
								})
								return
							}
							if (ai_original_img) {
								clearTimeout(this.pollTimer);
								await this.$refs.loadingOverlay.complete();
								const _callbacks = callbacks || this.callbacks
								if (_callbacks.onSuccess) {
									_callbacks.onSuccess?.(res.data);
									return;
								}
							} else {
								// 继续轮询
								this.pollTimer = setTimeout(checkStatus, 5000);
							}
						});
					} catch (e) {
						clearTimeout(this.pollTimer);
						this.loading = false;
						_this.callbacks?.onFail?.();
					}
				};

				setTimeout(() => {
					checkStatus(); // 启动轮询
				}, 20000);
			},
		},
	};
</script>

<style scoped></style>
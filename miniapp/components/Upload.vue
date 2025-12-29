<template>
	<view class="upload-container">
		<view class="upload-list">
			<view v-for="(img, idx) in fileList" :key="img" class="upload-item">
				<image :src="img" class="upload-img" mode="aspectFill" />
				<view class="delete-btn" @click="onRemove(idx)">×</view>
			</view>
			<view v-if="fileList.length < maxCount" class="upload-add" @click="onChooseImage">
				<view class="plus">+</view>
				<view class="tip">最多{{ maxCount }}张图片</view>
			</view>
		</view>
	</view>
</template>

<script>
import { handleUpload } from '@/utils/upload'
export default {
	name: "Upload",
	props: {
		maxCount: {
			type: Number,
			default: 3,
		},
		value: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			fileList: [...this.value],
		};
	},
	watch: {
		value(val) {
			this.fileList = [...val];
		},
	},
	methods: {
		onChooseImage() {
			// 这里以uni.chooseImage为例，实际项目可根据平台调整
			uni.chooseImage({
				count: this.maxCount - this.fileList.length,
				success: async (res) => {
					uni.showLoading({ title: '上传中' });
					try {
						const uploadPromises = res.tempFilePaths.map(async (filePath) => {
							const { url: uploadUrl = '' } = await handleUpload(filePath);
							return uploadUrl;
						});
						const uploadedUrls = await Promise.all(uploadPromises);
						this.fileList = [...this.fileList, ...uploadedUrls].slice(0, this.maxCount);
						this.$emit("update:value", this.fileList);
					} catch (e) {
						console.error('上传失败：', e);
						uni.showToast({ title: '上传失败', icon: 'none' });
					} finally {
						uni.hideLoading();
					}
				},
			});
		},
		onRemove(idx) {
			this.fileList.splice(idx, 1);
			this.$emit("update:value", this.fileList);
		},
	},
};
</script>

<style scoped>
.upload-container {
	display: flex;
	flex-direction: column;
}

.upload-list {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.upload-item {
	position: relative;
	margin-right: 12px;
}

.upload-img {
	width: 100px;
	height: 100px;
	border-radius: 8px;
	background: #f5f5f5;
}

.delete-btn {
	position: absolute;
	top: -8px;
	right: -8px;
	background: #333;
	color: #fff;
	border-radius: 50%;
	width: 22px;
	height: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	cursor: pointer;
	z-index: 2;
}

.upload-add {
	width: 100px;
	height: 100px;
	border: 1px dashed #ccc;
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #bbb;
	cursor: pointer;
}

.plus {
	font-size: 36px;
	line-height: 1;
}

.tip {
	font-size: 12px;
	margin-top: 8px;
}
</style>
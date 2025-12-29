<template>
	<web-view :src="webUrl" @message="handleMessage" style="position: absolute;left: -99px;top: -99px" />
</template>

<script>
import _ from 'lodash'

export default {
	data() {
		return {
			imageSize: {
				type: Object,
				default: {}
			},
			webUrl: '',
			canvasId: 'signatureCanvas',
			canvasWidth: 300,
			canvasHeight: 400
		}
	},
	onLoad(options) {
		const { date, location, tmpId, imageSize } = options;
		const { city, street } = JSON.parse(location || '{}');
		const { width = 0, height = 0 } = JSON.parse(imageSize || '{}');
		const url = `https://lalaman.novsoft.cn/html/templates/signature${Number(tmpId) + 1}.html?date=${date}&city=${city}&street=${street}&width=${width}&height=${height}`;
		this.imageSize = { width, height }
		this.webUrl = url
	},
	watch: {

	},
	mounted() {

	},
	methods: {
		handleMessage(e) {
			const eventChannel = this.getOpenerEventChannel()
			eventChannel.emit('dataFromCreateSignature', {
				data: e?.detail?.data?.[0]?.base64Image
			})
		},

	},
	watch: {
	}
}
</script>

<style lang="less"></style>
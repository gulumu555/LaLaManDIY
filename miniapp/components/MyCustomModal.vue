<template>
    <dialog v-if="visible" class="modal-dialog" :open="visible" @click="handleMaskClick">
        <div class="modal-content" @click.stop>
            <div class="modal-title">
                <text>提示</text>
                <image src="/static/back.svg" class="icon" mode="aspectFit" @tap="handleClose"></image>
            </div>
            <div class="modal-body">
                <image src="/static/tips-exclamation.svg" class="icon" mode="aspectFit"></image>
                <text>照片精度不符合要求，请重新选择尺寸或者重新选择照片。</text>
            </div>
            <div class="modal-buttons">
                <button class="btn-2" @tap="handleClose">重选尺寸</button>
                <button class="btn-2" @tap="handleReSelect">重选照片</button>
                <Create :params="params" :callbacks="callbacks">
                    <button class="btn-3">精度增强</button>
                </Create>
            </div>
        </div>
    </dialog>
</template>
<script>
import Create from '@/components/Create.vue'
export default {
    components: {
        Create
    },
    props: {
        visible: Boolean,
        params: {},
        callbacks: {},
        maskClosable: {
            type: Boolean,
            default: true
        }
    },
    data() {
    },
    mounted() {
    },
    methods: {
        handleClose() {
            this.$emit('close', 0)
        },
        handleReSelect() {
            this.$emit('reSelect')
        },
        handleMaskClick() {
            if (this.maskClosable) {
                this.handleClose()
            }
        }
    },
    watch: {
    }
}
</script>

<style scoped>
.modal-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999999999;
    animation: fadeIn 0.3s ease-out;
    border: none;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
}

.modal-content {
    background: #fff;
    width: 600rpx;
    border-radius: 16rpx;
    padding: 26rpx 40rpx 40rpx;
    text-align: center;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-50rpx);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-title {
    font-weight: bold;
    font-size: 32rpx;
    margin-bottom: 48rpx;
    display: flex;
    justify-content: space-between;
}

.modal-title .icon {
    width: 36rpx;
    height: 36rpx;
}

.modal-body {
    font-size: 28rpx;
    margin-bottom: 30rpx;
    display: flex;
    gap: 20rpx;
    line-height: 48rpx;
    text-align: left;
}

.modal-body .icon {
    width: 36rpx;
    height: 36rpx;
    margin-top: 4rpx;
}

.modal-buttons {
    margin: 60rpx auto auto;
    display: flex;
    gap: 26rpx;
    justify-content: space-between;
}

.modal-buttons button {
    width: 180rpx;
    height: 80rpx;
    line-height: 76rpx;
}
</style>
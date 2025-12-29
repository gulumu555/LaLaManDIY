<template>
    <view class="signature-list-item signature-list-item2" :class="className" @click="onClick">
        <view class="item">
            <view class="quarter-circle"></view>
            <view class="text">
                <view class="date">{{ formattedDate }}</view>
                <view class="position">
                    {{ signatureData?.location?.street }}.{{ getWeek(signatureData?.date) }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import dayjs from 'dayjs'
import { getWeek } from '@/utils/base'
export default {
    name: 'Signature2',
    props: {
        signatureData: {
            type: Object,
            default: () => ({})
        },
        className: {
            type: String,
            default: ''
        }
    },
    computed: {
        formattedDate() {
            if (!this.signatureData?.date) return '';
            return dayjs(this.signatureData.date).format('YYYYMMDD');
        },
    },
    methods: {
        onClick() {
            this.$emit('onClick');
        },
        getWeek(date) {
            return getWeek(date);
        }
    }
}
</script>

<style lang="less" scoped>
.signature-list-item2 {
    .item {
        display: flex;
        font-size: 24rpx;

        .quarter-circle {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
            background: conic-gradient(transparent 150deg,
                    transparent 60deg,
                    #010101 60deg,
                    #010101 270deg);
            mask-image: radial-gradient(circle, transparent 47rpx, black 49rpx);
        }

        .text {
            margin-top: 12rpx;
            margin-left: -48rpx;
        }
    }

    &.active {
        .item {
            .quarter-circle {
                background: conic-gradient(transparent 150deg,
                        transparent 60deg,
                        #ffffff 60deg,
                        #ffffff 270deg);
            }
        }
    }
}
</style>
<template>
    <view class="signature-list-item signature-list-item4" :class="className" @click="onClick">
        <view class="item">
            <view class="text">
                <view class="text-left">
                    <view class="week">{{ getWeek(signatureData?.date) }}</view>
                    <view class="date">{{ formattedDate }}</view>
                </view>
            </view>
            <view class="postion">{{ signatureData?.location?.city }}.{{ signatureData?.location?.street }}</view>
        </view>
    </view>
</template>

<script>
import dayjs from 'dayjs'
import { getWeek } from '@/utils/base'

export default {
    name: 'Signature4',
    props: {
        className: {
            type: String,
            default: ''
        },
        signatureData: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        formattedDate() {
            if (!this.signatureData?.date) return '';
            return dayjs(this.signatureData?.date).format('YYYY.MM.DD');
        },
    },
    methods: {
        onClick(index) {
            this.$emit('onClick', index);
        },
        getWeek(date) {
            return getWeek(date);
        }
    }
}
</script>

<style lang="less" scoped>
.signature-list-item4 {
    .item {
        .text {
            &-left {
                text-align: right;
                padding-right: 54rpx;
                background: url('/static/signature4.svg') no-repeat right center;
                background-size: 40rpx;
                position: relative;

                &::after {
                    content: '';
                    position: absolute;
                    width: 2rpx;
                    right: 44rpx;
                    top: 0;
                    bottom: 0;
                    background-color: #010101;
                }
            }
        }

        .postion {
            background: url('/static/signature4-1.svg') no-repeat left center;
            margin: 6rpx auto auto;
            font-size: 20rpx;
            font-weight: 600;
            width: fit-content;
            padding-left: 26rpx;
        }
    }

    &.active {
        .item {
            .text {
                &-left {
                    background: url('/static/signature4-white.svg') no-repeat right center;

                    &::after {
                        background-color: #ffffff;
                    }
                }
            }

            .postion {
                background: url('/static/signature4-1-white.svg') no-repeat left center;
            }
        }
    }
}
</style>
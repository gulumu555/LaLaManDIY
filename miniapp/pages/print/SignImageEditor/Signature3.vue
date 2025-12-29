<template>
    <view class="signature-list-item signature-list-item3" :class="className" @click="onClick">
        <view class="item">
            <view class="year">2025</view>
            <view class="month">{{ formatDateWithOrdinal(signatureData?.date) }}</view>
            <view class="week">{{ getWeekdayName(signatureData?.date) }}</view>
            <view class="postion">{{ signatureData?.location?.city }}.{{ signatureData?.location?.street }}</view>
        </view>
    </view>
</template>

<script>
import dayjs from 'dayjs'
export default {
    name: 'Signature3',
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
            return {
                year: dayjs(this.signatureData.date).format('YYYY'),
                month: dayjs(this.signatureData.date).format('MM'),
                day: dayjs(this.signatureData.date).format('DD'),
                week: getWeek(this.signatureData.date),
            }
        }
    },
    methods: {
        onClick() {
            this.$emit('onClick');
        },
        getOrdinalSuffix(day) {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        },
        // 格式化日期为 "June 20th"
        formatDateWithOrdinal(date) {
            const month = dayjs(date).format('MMMM');
            const day = dayjs(date).date();
            const suffix = this.getOrdinalSuffix(day);
            return `${month} ${day}${suffix}`;
        },
        // 获取星期名称
        getWeekdayName(date) {
            const weekdays = [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday',
                'Thursday', 'Friday', 'Saturday'
            ];
            const dayIndex = dayjs(date).day();
            return weekdays[dayIndex].toUpperCase();
        }
    }
}
</script>

<style lang="less" scoped>
.signature-list-item3 {
    .item {
        border-left: 4rpx solid #010101;
        padding-left: 12rpx;
        font-size: 20rpx;

        .year {
            font-size: 40rpx;
            font-weight: 600;
            line-height: 1;
            margin-top: -4rpx;
        }

        .month {
            margin-top: 4rpx;
        }

        .postion {
            margin-top: 4rpx;
            font-weight: 600;
            line-height: 1;
        }
    }

    &.active {
        .item {
            border-left: 4rpx solid #ffffff;
        }
    }
}
</style>
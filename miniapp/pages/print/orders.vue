<template>
	<z-paging ref="paging" v-model="dataList" @query="requestOrdersList">
		<template #top>
			<Header>打印订单</Header>
			<Tabs :tabs="tabList" v-model="activeTab" @onChange="onTabChange" :disabled="loading" />
		</template>
		<view class="item" v-for="(item, index) in dataList">
			<view style="margin: 20rpx 30rpx auto;" :key="item?.id">
				<OrderDetail :record="item" :displayRange="[0, 1, 2, 3]" @onAction="onAction" @refresh="onPaySuccess"
					:key="item?.id" />
			</view>
		</view>
		<template #empty>
			<Empty />
		</template>
	</z-paging>

	<ModalOrderDetail ref="modalOrderDetail" :order="orderItem" :visible="visibles['order-detail']"
		@close="visibles['order-detail'] = false" @onAction="onAction" />

	<Logistics :order="orderItem" :visible="visibles['logistics']" @close="visibles['logistics'] = false" />

	<ApplySalesDetail :order="orderItem" :visible="visibles['apply-sales-detail']" @refresh="onPaySuccess"
		@close="visibles['apply-sales-detail'] = false" @onApplyAfterSales="onAction({ action: 'apply-sales' })" />

	<ApplySales :order="orderItem" :visible="visibles['apply-sales']" @close="visibles['apply-sales'] = false"
		@refresh="onPaySuccess" />
</template>

<script>
import Header from '@/components/Header.vue';
import Tabs from '@/components/Tabs.vue'
import Card from '@/components/Card.vue'
import OrderDetail from '@/components/OrderDetail.vue';
import ModalOrderDetail from '@/components/ModalOrderDetail.vue'
import Logistics from '@/components/Logistics.vue'
import ApplySalesDetail from '@/components/ApplySalesDetail.vue'
import ApplySales from '@/components/ApplySales.vue'
import Empty from '@/components/Empty.vue'
import apiUser from '@/api/user';

export default {
	components: {
		Header,
		Empty,
		Card,
		Tabs,
		OrderDetail,
		ModalOrderDetail,
		Logistics,
		ApplySalesDetail,
		Logistics,
		ApplySales,
	},
	data() {
		return {
			dataList: [],
			activeTab: -1,
			infiniteParams: null,
			visibles: { 'order-detail': false, 'logistics': false, 'apply-sales-detail': false, 'apply-sales': false },
			orderItem: null,
			loading: false,
			tabList: [{
				label: '全部',
				value: 0
			},
			{
				label: '待支付',
				value: 1
			},
			{
				label: '待发货',
				value: 3
			},
			{
				label: '待收货',
				value: 4
			},
			{
				label: '已完成',
				value: 5
			},

			{
				label: '售后/退款',
				value: 6
			},
			]
		};
	},
	onLoad() {
		this.onTabChange(0)
	},
	methods: {
		onAction({ action, record }) {
			record && (this.orderItem = record);
			this.visibles[action] = true
		},
		onTabChange(index) {
			this.activeTab = index
			this.onPaySuccess()
		},
		requestOrdersList(pageNo, pageSize) {
			apiUser.ordersList({
				page: pageNo,
				pageSize,
				...this.infiniteParams
			}).then(res => {
				this.refreshCurrentItem(res.data.data)
				this.$refs.paging.complete(res.data.data);
			})
		},
		async onPaySuccess() {
			// 等待500ms刷新列表
			try {
				await new Promise(resolve => setTimeout(resolve, 800))
				this.$refs.paging.reload(true);
			} catch (e) { }
		},
		refreshCurrentItem(dataList) {
			if (!this.orderItem?.id) return;
			const newItem = dataList.find(item => item.id === this.orderItem.id)
			if (newItem) {
				this.orderItem = newItem
			}
		}
	},
	watch: {
		activeTab: {
			handler(newVal) {
				this.infiniteParams = {
					order_status: this.tabList[newVal]?.value
				}
			},
		},
	}
}
</script>

<style lang="less" scoped>
.order-content {
	display: flex;
	justify-content: space-between;

	.image {
		width: 160rpx;
		height: 160rpx;
		background-color: #eee;
	}

	&-right {
		width: calc(100% - 180rpx);
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		&-title {
			font-size: 24rpx;
		}

		.btn-wrapper {
			display: flex;
			justify-content: flex-end;
			gap: 20rpx;

			button {
				margin: 0;
				width: 140rpx;
				height: 68rpx;
				line-height: 68rpx;
			}
		}
	}
}
</style>
<template>
	<scroll-view ref="infiniteList" scroll-y @scrolltolower="loadMore" @scroll="handleScroll" :style="styles"
		:show-scrollbar="false">
		<!-- 列表项 -->
		<template v-for="(item, index) in list" :key="item ? item[rowKey] : index" v-if="list.length > 0">
			<slot :item="item" :index="index" />
		</template>
		<!-- 状态提示 -->
		<view class="status" v-if="loadStatus === 'loading'">加载中...</view>
		<Empty v-if="list.length === 0 && loadStatus !== 'loading'" />
		<view class="status" v-else-if="loadStatus === 'nomore'">已经到底了~</view>
	</scroll-view>
</template>

<script>
import Empty from "@/components/Empty.vue";
export default {
	components: {
		Empty,
	},
	props: {
		fetchFn: {
			type: Function,
			required: true,
		},
		scroll: {
			type: Function,
		},
		pageSize: {
			type: Number,
			default: 20,
		},
		params: {
			type: Object,
			default: () => ({}),
		},
		styles: {
			type: Object,
			default: () => ({}),
		},
		rowKey: {
			type: String,
			default: 'id',
		},
		hasDefaultData: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			list: [],
			page: 1,
			loadStatus: "loadmore",
			requestId: 0, // 新增
		};
	},
	mounted() {
		this.loadMore();
	},
	methods: {
		async loadMore({ forceLoad = false } = {}) {
			if (this.loadStatus !== "loadmore" && !forceLoad) return;
			this.loadStatus = "loading";
			this.requestId += 1; // 新请求，id+1
			const currentRequestId = this.requestId;
			try {
				const resData = await this.fetchFn({
					...this.params,
					page: this.page,
					pageSize: this.pageSize,
				});
				// 只处理最新请求
				if (currentRequestId !== this.requestId) return;

				const { current_page = 1, last_page = 0, data = [] } = resData?.data || {};
				this.list = [...this.list, ...data];
				(this.list.length === 0 && this.hasDefaultData) && this.list.push(null);


				if (current_page >= last_page) {
					this.loadStatus = "nomore";
				} else {
					this.loadStatus = "loadmore";
					this.page += 1;
				}
			} catch (err) {
				if (currentRequestId !== this.requestId) return; // 只处理最新请求
				console.error("加载失败", err);
				this.loadStatus = "loadmore";
			}
		},
		handleScroll(e) {
			this.scroll && this.scroll(e)
		},
		refresh() {
			this.page = 1;
			this.list = [];
			this.loadStatus = "loadmore";
			this.loadMore({ forceLoad: true });
		}
	},
	watch: {
		params: {
			handler() {
				this.page = 1;
				this.list = [];
				this.loadMore({
					forceLoad: true
				});
			},
			deep: true,
		},
		loadStatus: {
			handler(newVal) {
				this.$emit('load-status-change', newVal);
			},
			deep: true,
		},
	},
};
</script>

<style scoped>
.status {
	text-align: center;
	color: #888;
	font-size: 26rpx;
	padding: 30rpx 0;
}
</style>
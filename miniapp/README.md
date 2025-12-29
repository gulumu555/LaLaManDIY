API:
链接: https://apifox.com/apidoc/shared-4b25f1b9-0d51-4785-9026-9d53d979e04f
访问密码: 6Opm6ejG
原型图：
[](https://modao.cc/proto/vxZbxrxGswyhs6relvq0u/sharing?view_mode=device)

无限滚动：
import InfiniteList from '@/components/InfiniteList.vue'
<InfiniteList :fetchFn="requestProductList" :params="{ cate_id: 1 }">
<template #default="{ item }">
<view class="image-list-item" @click="onChangeProduct(item)">
<image :src="item?.main_image"
				:class="['image', currentProduct.id === item.id ? 'active' : '']" mode=""></image>
<view class="name">
{{item?.product_name}}
</view>
</view>
</template>
</InfiniteList>

async requestProductList(params) {
return apiUser.photoOrder(params)
}



省市区联动：
import RegionPicker from '@/components/RegionPicker.vue'
<RegionPicker v-model="region" />
region：
{
"province": 1,
"city": 2,
"county": 4,
"provinceText": "北京市",
"cityText": "北京市",
"countyText": "西城区"
}


header高度：height: 'calc(100vh - 47px - 78rpx)'
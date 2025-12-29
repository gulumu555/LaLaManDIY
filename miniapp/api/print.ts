import request from "@/utils/request";
export default {
	categoryList: (data) => {
		return request.get("/api/Category/getList", data);
	},
	// 产品列表
	productList: (data : object) => {
		return request.get("/api/product/getList", data);
	},
	// 二级风格
	photoStyleList: (data : object) => {
		return request.get("/api/PhotoStyle/getList", data);
	},
	// 产品规格列表
	productSpecList: (data : object) => {
		return request.get("/api/productSpec/getList", data);
	},
	// 生成图片
	create: (data : object) => {
		return request.post("/api/PhotoOrder/create", data);
	},
	// 查询生图订单
	findPhotoOrder: (id) => {
		return request.get("/api/PhotoOrder/findData", { id });
	},
};
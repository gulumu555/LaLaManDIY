import request from "@/utils/request";
export default {
  serviceProductList: () => {
    return request.get("/api/ServiceProduct/getList");
  },
  // 生成订单
  create: (data) => {
    return request.post("/api/Orders/create", data);
  },
  // 重新付款
  repay: (id) => {
    return request.post("/api/Orders/repay", { id });
  },
  // 确认收货
  confirmReceipt: (id) => {
    return request.post("/api/Orders/confirm", { id });
  },
  // 取消订单
  cancelOrder: (id) => {
    return request.post("/api/Orders/cancel", { id });
  },
  // 删除订单
  deleteOrder: (id) => {
    return request.post("/api/Orders/delete", { id });
  },
  // 申请售后
  applyAfterSale: (data) => {
    return request.post("/api/Orders/refund", data);
  },
  // 撤销申请
  cancelAfterSale: (id) => {
    return request.post("/api/OrderRefund/cancel", { id });
  },
  // 物流跟踪
  logisticsTrace: (id) => {
    return request.get("/api/Orders/logistics", { id });
  },
  // 售后详情
  afterSaleDetail: (id) => {
    return request.get("/api/Orders/refundInfo", { id });
  },
};

import request from "@/utils/request";
export default {
  // 获取配置信息
  getConfig: () => {
    return request.get("/api/Config/getConfig");
  },
  getUserInfo: () => {
    return request.get("/api/User/getUserInfo");
  },
  ordersList: (data) => {
    return request.get("/api/Orders/getList", data);
  },
  // 修改个人信息
  updateInfo: (data) => {
    return request.post("/api/User/updateInfo", data);
  },
  // 通过code获取手机号码
  getPhone: (data) => {
    return request.post("/api/Login/getPhoneNumber", data);
  },
  // 基础协议
  agreement: (data) => {
    return request.post("/api/Config/getConfig", data);
  },
  // 收货地址列表
  userAddress: (data) => {
    return request.post("/api/UserAddress/getList", data);
  },
  // 新增收货地址
  createAddress: (data) => {
    return request.post("/api/UserAddress/create", data);
  },
  // 修改收货地址
  updateAddress: (data) => {
    return request.post("/api/UserAddress/update", data);
  },
  // 删除收货地址
  deleteAddress: (data) => {
    return request.post("/api/UserAddress/delete", data);
  },
  // 生图订单列表
  photoOrder: (data) => {
    return request.get("/api/PhotoOrder/getList", data);
  },
  // 分销码
  getDistributionCode: (data) => {
    return request.post("/api/user/qrcode", data);
  },
  // 拉起收款页面参数
  getWithdrawOrderPackInfo: (data) => {
    return request.get("/api/WithdrawOrder/getPackInfo", data);
  },
  // 全令牌 SessionToken
  getCertification: () => {
    return request.get("/api/File/certification");
  },
  // 获取地区
  getRegion: (data) => {
    return request.get("/api/Region/getList", data);
  },
  // 获取充值记录
  getRechargeRecord: (data) => {
    return request.get("/api/Payments/getList", data);
  },
  // 关闭订单
  cancelRechargeOrder: (order_id) => {
    return request.post("/api/Payments/cancel", { order_id });
  },
  // 资产信息
  getRechargeInfo: () => {
    return request.get("/api/User/rechargeInfo");
  },
  // 根据经纬度获取位置接口
  getLocation: (lat, lng) => {
    return request.get("/api/Region/getLocation", { lat, lng });
  },
};

import request from "@/utils/request";
export default {
  // 佣金明细
  userBalanceLog: (data) => {
    return request.get("/api/UserBalanceLog/getList", data);
  },
  // 提现记录
  withDrawOrder: (data) => {
    return request.get("/api/WithDrawOrder/getList", data);
  },
  // 推荐记录
  userInvite: (data) => {
    return request.post("/api/UserInvite/getList", data);
  },
  // 发起提现
  onWithdraw: (data) => {
    return request.post("/api/WithdrawOrder/withdraw", data);
  },
};

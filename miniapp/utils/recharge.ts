import _ from "lodash";
import apiRecharge from "@/api/recharge";

interface CreateOrderParams {
  orderId: string; // 或其他下单必要参数
  payment_amount?: number;
}

interface PayCallbacks {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (err?: any) => void;
}

interface WxPayParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: "MD5" | "RSA"; // 可扩展更多签名类型
  paySign: string;
}

/**
 * 创建订单并调起微信支付
 * @param createParams 下单参数（如 orderId）
 */
export async function createAndPayOrder(
  createParams: CreateOrderParams,
  callbacks: PayCallbacks = {}
): Promise<void> {
  try {
    uni.showLoading({
      title: "加载中",
      mask: true,
    });
    apiRecharge
      .create(createParams)
      .then((res) => {
        const payment_amount = createParams?.payment_amount || 0;
        if (payment_amount === 0) {
          uni.showToast({ title: "购买成功", icon: "none" });
          callbacks.onSuccess?.();
          return;
        }
        wxPay(res.data, callbacks);
      })
      .catch((err) => {})
      .finally(() => {
        uni.hideLoading();
      });
  } catch (err: any) {
    if (err?.errMsg?.includes("cancel")) {
      callbacks.onCancel?.();
    } else {
      callbacks.onError?.(err);
    }
  }
}

/**
 * 调起微信支付
 * @param params 后端返回的微信支付参数
 * @returns Promise<void>
 */
export function wxPay(
  params: WxPayParams,
  callbacks: PayCallbacks = {}
): Promise<void> {
  const payParams = _.pick(params, [
    "timeStamp",
    "nonceStr",
    "package",
    "signType",
    "paySign",
  ]);
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: "wxpay",
      ...payParams,
      success: (res) => {
        console.log("支付成功：", res);
        callbacks.onSuccess?.();
        resolve();
      },
      fail: (err) => {
        console.error("支付失败：", err);
        callbacks.onError?.(err);
        reject(err);
      },
      cancel: () => {
        console.log("支付取消");
        callbacks.onCancel?.();
        reject(new Error("cancel"));
      },
    });
  });
}

// 重新支付订单
export function handlePayNow(order_no, callbacks) {
  uni.showLoading({
    title: "加载中",
    mask: true,
  });
  apiRecharge
    .repay(order_no)
    .then((res) => {
      wxPay(res.data, {
        onSuccess: () => {
          uni.showToast({ title: "支付成功", icon: "success" });
          callbacks.onSuccess?.();
        },
        onError: () => {
          uni.showToast({ title: "支付失败", icon: "none" });
          callbacks.onError?.();
        },
        onCancel: () => {
          uni.showToast({ title: "取消支付", icon: "none" });
          callbacks.onCancel?.();
        },
      });
    })
    .catch(() => {
      uni.showToast({ title: "支付失败", icon: "none" });
    })
    .finally(() => {
      uni.hideLoading();
    });
}

/**
 *计算折扣金额
 * @param param0 {
 *  user_balance: number; // 用户余额
 *  balanceDeduct: boolean; // 是否使用余额抵扣
 *  price_adjustment: number; // 价格调整
 * @returns {
 *  balance_amount: number; // 余额抵扣金额
 *  max_balance_amount: number; // 最大余额
 * }
 */
export const calculateMaxDiscountAmount = ({
  user_balance,
  balanceDeduct,
  price_adjustment,
}: {
  user_balance: number;
  balanceDeduct: boolean;
  price_adjustment: number;
}) => {
  // user_balance 不存在则终止计算，有为0的情况
  if (user_balance == null || isNaN(user_balance)) return;
  const balance_amount = Number(balanceDeduct ? user_balance || 0 : 0);
  price_adjustment = Number(price_adjustment || 0);
  const _balance_amount =
    balance_amount > price_adjustment ? price_adjustment : balance_amount;
  const max_balance_amount =
    user_balance > price_adjustment ? price_adjustment : user_balance;
  return {
    balance_amount: _balance_amount,
    max_balance_amount,
  };
};

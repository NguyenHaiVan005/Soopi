import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, Package, Truck, ShoppingBag } from 'lucide-react';
import { formatVND } from '../utils/format';

export default function OrderSuccessModal({ order, onClose, onTrackOrder }) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.order_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Checkmark Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">
          Đặt Hàng Thành Công!
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Cảm ơn bạn đã tin tưởng mua sắm tại Soopi. Đơn hàng của bạn đang được xử lý và chuẩn bị đóng gói.
        </p>

        {/* Order Code Box */}
        <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Mã đơn hàng:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-bold text-soopi-600 hover:text-soopi-700 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>
          </div>
          <div className="text-lg font-black tracking-wider text-gray-900 font-mono">
            {order.order_code}
          </div>

          <div className="mt-3 pt-3 border-t border-orange-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400 block">Tổng thanh toán:</span>
              <span className="font-bold text-soopi-600">{formatVND(order.total_amount)}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Thanh toán:</span>
              <span className="font-bold text-gray-800">
                {order.payment_method === 'COD' ? 'Khi nhận hàng (COD)' : 'Chuyển khoản'}
              </span>
            </div>
          </div>
        </div>

        {/* Benefits reminder */}
        <div className="bg-gray-50 rounded-xl p-3 mb-6 text-[11px] text-gray-600 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-orange-500" /> Giao hàng 2-3 ngày
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-emerald-500" /> Đồng kiểm khi nhận
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              if (onTrackOrder) onTrackOrder(order.order_code);
            }}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Theo dõi tiến độ đơn hàng
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-soopi-500 hover:bg-soopi-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Tiếp tục mua sắm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


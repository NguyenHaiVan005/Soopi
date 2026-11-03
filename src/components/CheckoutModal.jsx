import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Truck, CreditCard, ShieldCheck, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatVND } from '../utils/format';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ onClose, onOrderPlaced }) {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_address: user?.address || '',
    customer_note: '',
    payment_method: 'COD',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_phone: prev.customer_phone || user.phone || '',
        customer_address: prev.customer_address || user.address || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim()) {
      setError('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!formData.customer_phone.trim()) {
      setError('Vui lòng nhập số điện thoại nhận hàng.');
      return;
    }
    if (!formData.customer_address.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng chi tiết.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_address: formData.customer_address.trim(),
        customer_note: formData.customer_note.trim(),
        payment_method: formData.payment_method,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.order) {
        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        clearCart();
        onClose();
        if (onOrderPlaced) {
          onOrderPlaced(res.order);
        }
      } else {
        setError(res.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-soopi-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Xác Nhận & Đặt Hàng</h2>
              <p className="text-xs text-gray-500">Giao hàng tận nơi - Kiểm tra hàng trước khi thanh toán</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Customer Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-100 text-soopi-600 flex items-center justify-center text-[10px] font-black">1</span>
              Thông Tin Người Nhận
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Họ và tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Số điện thoại nhận hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0987654321"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Địa chỉ giao hàng chi tiết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ghi chú giao hàng (tuỳ chọn)
                </label>
                <input
                  type="text"
                  placeholder="Giao giờ hành chính, gọi điện trước khi đến..."
                  value={formData.customer_note}
                  onChange={(e) => setFormData({ ...formData, customer_note: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-100 text-soopi-600 flex items-center justify-center text-[10px] font-black">2</span>
              Phương Thức Thanh Toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* COD Option */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  formData.payment_method === 'COD'
                    ? 'border-soopi-500 bg-orange-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  checked={formData.payment_method === 'COD'}
                  onChange={() => setFormData({ ...formData, payment_method: 'COD' })}
                  className="mt-1 text-soopi-600 focus:ring-soopi-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <Truck className="w-4 h-4 text-soopi-500" />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Thanh toán tiền mặt cho shipper khi nhận được bưu kiện.
                  </p>
                </div>
              </label>

              {/* Bank Transfer Option */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  formData.payment_method === 'BANK_TRANSFER'
                    ? 'border-soopi-500 bg-orange-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="BANK_TRANSFER"
                  checked={formData.payment_method === 'BANK_TRANSFER'}
                  onChange={() => setFormData({ ...formData, payment_method: 'BANK_TRANSFER' })}
                  className="mt-1 text-soopi-600 focus:ring-soopi-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span>Chuyển khoản Ngân hàng / QR</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Quét mã VietQR tiện lợi với mọi app ngân hàng.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Order Items Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-100 text-soopi-600 flex items-center justify-center text-[10px] font-black">3</span>
              Kiểm Tra Đơn Hàng ({items.length} món)
            </h3>

            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 border border-gray-100 rounded-2xl p-3 bg-gray-50">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <img src={item.image_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <span className="truncate text-gray-800">{item.name} <b className="text-soopi-600">x{item.quantity}</b></span>
                  </div>
                  <span className="font-bold text-gray-900">{formatVND(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total calculation */}
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-semibold text-gray-800">{formatVND(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí giao hàng toàn quốc:</span>
                <span className="text-emerald-600 font-bold">0₫ (Miễn phí)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Tổng số tiền cần thanh toán:</span>
                <span className="text-lg font-black text-soopi-600">{formatVND(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-3 px-5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Quay lại
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-soopi-500 to-orange-500 hover:from-soopi-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Xác Nhận Đặt Hàng ({formatVND(totalPrice)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


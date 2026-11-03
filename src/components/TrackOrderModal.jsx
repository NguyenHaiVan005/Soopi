import React, { useState, useEffect } from 'react';
import { X, Search, Package, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { api } from '../api/client';
import { formatVND, formatDate, getOrderStatusBadge } from '../utils/format';

export default function TrackOrderModal({ initialCode = '', onClose }) {
  const [orderCode, setOrderCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const fetchOrder = async (codeToSearch) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await api.trackOrder(codeToSearch.trim());
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.message || 'Không tìm thấy thông tin đơn hàng này.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tra cứu đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchOrder(initialCode);
    }
  }, [initialCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderCode);
  };

  // Steps for timeline
  const steps = [
    { key: 'pending', label: 'Đặt hàng thành công', icon: ShoppingBag, desc: 'Đơn hàng đã được tiếp nhận' },
    { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle2, desc: 'Người bán đang chuẩn bị hàng' },
    { key: 'shipping', label: 'Đang vận chuyển', icon: Truck, desc: 'Đơn hàng đang trên đường giao đến bạn' },
    { key: 'delivered', label: 'Giao hàng thành công', icon: Package, desc: 'Khách hàng đã nhận kiện hàng' },
  ];

  const getStepStatus = (stepKey, currentStatus) => {
    if (currentStatus === 'cancelled') return 'cancelled';
    const statusOrder = ['pending', 'confirmed', 'shipping', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);
    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-soopi-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Tra Cứu Tiến Độ Đơn Hàng</h2>
              <p className="text-xs text-gray-500">Nhập mã đơn hàng Soopi của bạn để theo dõi vị trí kiện hàng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-2">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Nhập mã đơn hàng (Ví dụ: SP-20261101-1001)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 font-mono outline-none"
            />
            <button
              type="submit"
              disabled={loading || !orderCode.trim()}
              className="px-5 py-2.5 bg-soopi-500 hover:bg-soopi-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Tra cứu</span>
            </button>
          </form>
        </div>

        {/* Body content */}
        <div className="p-6 pt-2">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs">Đang kiểm tra dữ liệu đơn hàng...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700 my-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="space-y-6 mt-4">
              {/* Order Quick Details */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-gray-400 block">Mã đơn hàng</span>
                  <span className="text-sm font-mono font-black text-gray-900">{order.order_code}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">Ngày đặt hàng</span>
                  <span className="text-xs font-semibold text-gray-800">{formatDate(order.created_at)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">Trạng thái</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getOrderStatusBadge(order.shipping_status).color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getOrderStatusBadge(order.shipping_status).dot}`}></span>
                    {getOrderStatusBadge(order.shipping_status).label}
                  </span>
                </div>
              </div>

              {/* Status Stepper Timeline */}
              {order.shipping_status === 'cancelled' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                  <span className="text-red-700 font-bold text-sm block">Đơn hàng đã bị hủy</span>
                  <p className="text-xs text-red-600 mt-1">Đơn hàng này đã kết thúc xử lý hoặc bị hủy bởi quản trị viên.</p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
                    {steps.map((st, idx) => {
                      const state = getStepStatus(st.key, order.shipping_status);
                      const isCompleted = state === 'completed';
                      const Icon = st.icon;

                      return (
                        <div key={st.key} className="flex flex-col items-center text-center p-2 rounded-xl">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-xs transition-colors ${
                              isCompleted
                                ? 'bg-soopi-500 text-white shadow-md shadow-orange-500/30'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className={`text-xs font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {st.label}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                            {st.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <h4 className="font-bold text-gray-900 mb-2">Thông Tin Giao Hàng</h4>
                  <p className="text-gray-700 font-semibold">{order.customer_name} - {order.customer_phone}</p>
                  <p className="text-gray-500 mt-1">{order.customer_address}</p>
                  {order.customer_note && (
                    <p className="text-gray-400 italic mt-2">Ghi chú: "{order.customer_note}"</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <h4 className="font-bold text-gray-900 mb-2">Thanh Toán & Vận Chuyển</h4>
                  <div className="space-y-1 text-gray-600">
                    <p>Hình thức: <b className="text-gray-900">{order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản'}</b></p>
                    <p>Trạng thái thanh toán: <b className={order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</b></p>
                    <p>Tổng giá trị đơn: <b className="text-base text-soopi-600">{formatVND(order.total_amount)}</b></p>
                  </div>
                </div>
              </div>

              {/* Ordered Items */}
              {order.items && order.items.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Sản phẩm trong đơn ({order.items.length})
                  </h4>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div className="flex items-center gap-3">
                          <img src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-gray-800 line-clamp-1">{item.product_name}</p>
                            <p className="text-gray-400 text-[11px]">{formatVND(item.price)} x {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">{formatVND(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


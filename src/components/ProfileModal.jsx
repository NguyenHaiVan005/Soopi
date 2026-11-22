import React, { useState, useEffect } from 'react';
import { X, User, Package, MapPin, Phone, Mail, Check, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatVND, formatDate, getOrderStatusBadge } from '../utils/format';

export default function ProfileModal({ onClose, onTrackOrder }) {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'info'
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Cancel order state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getMyOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateProfile(formData);
      setSuccessMsg('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Cập nhật thất bại.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Vui lòng nhập lý do hủy đơn hàng.');
      return;
    }
    setCancellingOrder(true);
    setCancelError('');
    try {
      const res = await api.cancelMyOrder(orderToCancel.id, cancelReason.trim());
      if (res.success) {
        setOrderToCancel(null);
        setCancelReason('');
        await fetchOrders();
      } else {
        setCancelError(res.message || 'Không thể hủy đơn hàng.');
      }
    } catch (err) {
      setCancelError(err.message || 'Có lỗi xảy ra khi hủy đơn hàng.');
    } finally {
      setCancellingOrder(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-soopi-600 to-orange-400 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-orange-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switch */}
        <div className="flex border-b border-gray-100 bg-gray-50/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-soopi-500 text-soopi-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Lịch Sử Đơn Mua ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'info'
                ? 'border-soopi-500 text-soopi-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông Tin Tài Khoản</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'orders' ? (
            <div>
              {loadingOrders ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs">Đang tải danh sách đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-700">Bạn chưa có đơn hàng nào</p>
                  <p className="text-xs text-gray-400 mt-1">Các đơn hàng bạn đặt sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    const badge = getOrderStatusBadge(o.shipping_status);
                    return (
                      <div key={o.id} className="border border-gray-200 rounded-2xl p-4 bg-white hover:border-orange-200 transition-all shadow-xs">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900">{o.order_code}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{formatDate(o.created_at)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                            <button
                              onClick={() => {
                                onClose();
                                if (onTrackOrder) onTrackOrder(o.order_code);
                              }}
                              className="text-soopi-600 hover:text-soopi-700 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer ml-1"
                            >
                              <span>Theo dõi</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="py-3 divide-y divide-gray-50">
                          {o.items?.map((item) => (
                            <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
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

                        {/* Cancel Reason display */}
                        {o.shipping_status === 'cancelled' && o.cancel_reason && (
                          <div className="mt-2 p-2.5 bg-red-50 border border-red-100 rounded-xl text-xs">
                            <span className="font-semibold text-red-700">
                              Lý do hủy {o.cancelled_by === 'admin' ? '(Người bán)' : '(Bạn)'}:
                            </span>
                            <span className="text-red-600 ml-1">{o.cancel_reason}</span>
                          </div>
                        )}

                        {/* Order Footer */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Phương thức: <b className="text-gray-700">{o.payment_method === 'COD' ? 'COD' : 'Ngân hàng'}</b>
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-gray-500">Tổng thanh toán:</span>
                            <span className="text-sm font-black text-soopi-600">{formatVND(o.total_amount)}</span>
                          </div>
                        </div>

                        {/* Cancel button for pending orders */}
                        {o.shipping_status === 'pending' && (
                          <div className="pt-2 mt-1">
                            <button
                              onClick={() => { setOrderToCancel(o); setCancelReason(''); setCancelError(''); }}
                              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
                            >
                              Hủy đơn hàng này
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpdateInfo} className="max-w-md mx-auto space-y-4">
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email (Cố định)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Địa chỉ giao hàng mặc định
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingInfo}
                className="w-full py-3 px-4 bg-soopi-500 hover:bg-soopi-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {savingInfo ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Lưu Thay Đổi Thông Tin</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Cancel Order Modal */}
    {orderToCancel && (
      <div className="fixed inset-0 z-[60] bg-gray-900/70 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-base font-bold text-gray-900 mb-1">Hủy đơn hàng</h3>
          <p className="text-xs text-gray-500 mb-4">
            Mã đơn: <span className="font-mono font-bold text-gray-800">{orderToCancel.order_code}</span>
          </p>

          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-700">Lý do hủy nhanh:</p>
            {['Tôi đặt nhầm sản phẩm', 'Tôi muốn thay đổi địa chỉ giao hàng', 'Tôi muốn đặt lại với số lượng khác', 'Tìm được nơi mua tốt hơn'].map((r) => (
              <button
                key={r}
                onClick={() => setCancelReason(r)}
                className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition-colors cursor-pointer ${
                  cancelReason === r ? 'border-soopi-500 bg-orange-50 text-soopi-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Hoặc nhập lý do của bạn..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs text-gray-900 outline-none resize-none"
          />

          {cancelError && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {cancelError}
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { setOrderToCancel(null); setCancelReason(''); setCancelError(''); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={cancellingOrder}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancellingOrder ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Xác nhận hủy đơn'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}


import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  X, 
  Lock, 
  Unlock, 
  ExternalLink,
  AlertCircle,
  Truck,
  RotateCcw,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { api } from '../api/client';
import { formatVND, formatDate, getOrderStatusBadge } from '../utils/format';

export default function AdminDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'customers'
  
  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Customers state
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerOrdersModal, setCustomerOrdersModal] = useState(null);

  // Notification message
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    loadOverview();
    loadCategories();
  }, []);

  const showNotice = (msg, isError = false) => {
    setActionNotice({ msg, isError });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const loadOverview = async () => {
    setLoadingStats(true);
    try {
      const res = await api.admin.getStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      showNotice(err.message, true);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.admin.getProducts();
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      showNotice(err.message, true);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async (query = orderSearch) => {
    setLoadingOrders(true);
    try {
      const params = {};
      if (query && query.trim()) params.q = query.trim();
      const res = await api.admin.getOrders(params);
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      showNotice(err.message, true);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await api.admin.getCustomers();
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err) {
      showNotice(err.message, true);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') loadOverview();
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'customers') loadCustomers();
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      await api.admin.deleteProduct(id);
      showNotice('Đã xóa sản phẩm thành công');
      loadProducts();
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newShippingStatus, newPaymentStatus) => {
    try {
      const payload = {};
      if (newShippingStatus) payload.shipping_status = newShippingStatus;
      if (newPaymentStatus) payload.payment_status = newPaymentStatus;

      await api.admin.updateOrderStatus(orderId, payload);
      showNotice(newShippingStatus === 'confirmed' ? 'Đã duyệt đơn hàng thành công' : 'Cập nhật trạng thái đơn hàng thành công');
      loadOrders();
      if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
        setSelectedOrderForDetail((prev) => ({
          ...prev,
          ...payload,
        }));
      }
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  // Confirm cancel order with reason
  const handleConfirmCancelOrder = async (reason) => {
    if (!orderToCancel) return;
    setCancellingOrder(true);
    try {
      await api.admin.updateOrderStatus(orderToCancel.id, {
        shipping_status: 'cancelled',
        cancel_reason: reason
      });
      showNotice('Đã hủy đơn hàng thành công');
      setOrderToCancel(null);
      loadOrders();
      if (selectedOrderForDetail && selectedOrderForDetail.id === orderToCancel.id) {
        setSelectedOrderForDetail((prev) => ({
          ...prev,
          shipping_status: 'cancelled',
          cancel_reason: reason,
          cancelled_by: 'admin'
        }));
      }
    } catch (err) {
      showNotice(err.message, true);
    } finally {
      setCancellingOrder(false);
    }
  };

  // Toggle lock customer
  const handleToggleCustomerStatus = async (customer) => {
    const actionText = customer.status === 'active' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản của ${customer.name}?`)) return;

    try {
      const res = await api.admin.toggleCustomerStatus(customer.id);
      showNotice(res.message);
      loadCustomers();
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  // View customer orders
  const handleViewCustomerOrders = async (customer) => {
    try {
      const res = await api.admin.getCustomerOrders(customer.id);
      setCustomerOrdersModal({
        customer,
        orders: res.orders || [],
      });
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  // Filtered lists
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(customerSearch))
  );

  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus !== 'all' && o.shipping_status !== orderFilterStatus) {
      return false;
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchCode = o.order_code?.toLowerCase().includes(q);
      const matchName = o.customer_name?.toLowerCase().includes(q);
      const matchPhone = o.customer_phone?.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/60 backdrop-blur-xs flex">
      {/* Toast Notice */}
      {actionNotice && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-white transition-all animate-in slide-in-from-top-3 ${
            actionNotice.isError ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {actionNotice.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-soopi-600 to-orange-400 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20">
              S
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                Trang Quản Trị Hệ Thống Soopi
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-soopi-700 px-2 py-0.5 rounded-full">
                  Admin Pro
                </span>
              </h1>
              <p className="text-xs text-gray-500">Quản lý toàn diện sản phẩm, đơn hàng và khách hàng</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedProductForEdit(null);
                setShowProductModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-soopi-500 hover:bg-soopi-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow-orange-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Sản Phẩm Vào Kệ Hàng</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Đóng Dashboard</span>
            </button>
          </div>
        </header>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex space-x-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-soopi-500 text-soopi-600 bg-orange-50/40'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tổng Quan & Thống Kê</span>
          </button>

          <button
            onClick={() => handleTabChange('products')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'border-soopi-500 text-soopi-600 bg-orange-50/40'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Kệ Hàng & Kho Sản Phẩm ({products.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-soopi-500 text-soopi-600 bg-orange-50/40'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Quản Lý Đơn Hàng</span>
          </button>

          <button
            onClick={() => handleTabChange('customers')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'customers'
                ? 'border-soopi-500 text-soopi-600 bg-orange-50/40'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý Khách Hàng</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {loadingStats ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs">Đang tải số liệu thống kê...</p>
                </div>
              ) : stats ? (
                <>
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 block">Tổng Doanh Thu</span>
                        <span className="text-2xl font-black text-emerald-600 mt-1 block">
                          {formatVND(stats.total_revenue)}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3.5 h-3.5" /> Doanh số thực tế
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 block">Tổng Đơn Hàng</span>
                        <span className="text-2xl font-black text-gray-900 mt-1 block">
                          {stats.total_orders}
                        </span>
                        <span className="text-[11px] text-gray-500 mt-1 block">Toàn hệ thống</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 block">Tổng Sản Phẩm</span>
                        <span className="text-2xl font-black text-gray-900 mt-1 block">
                          {stats.total_products}
                        </span>
                        <span className="text-[11px] text-gray-500 mt-1 block">Đang hoạt động</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-soopi-600 flex items-center justify-center">
                        <Package className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 block">Tổng Khách Hàng</span>
                        <span className="text-2xl font-black text-gray-900 mt-1 block">
                          {stats.total_customers}
                        </span>
                        <span className="text-[11px] text-gray-500 mt-1 block">Thành viên đăng ký</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Orders Status Distribution */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Phân Bố Trạng Thái Đơn Hàng</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map((stKey) => {
                        const found = stats.status_breakdown?.find((s) => s.shipping_status === stKey);
                        const count = found?.count || 0;
                        const badge = getOrderStatusBadge(stKey);

                        return (
                          <div
                            key={stKey}
                            onClick={() => {
                              setOrderFilterStatus(stKey);
                              setActiveTab('orders');
                              loadOrders();
                            }}
                            className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-200 cursor-pointer transition-all"
                          >
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                            <span className="text-2xl font-black text-gray-900 block mt-2">{count}</span>
                            <span className="text-[10px] text-gray-400">đơn hàng</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Orders Table */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">Đơn Hàng Gần Đây</h3>
                      <button
                        onClick={() => handleTabChange('orders')}
                        className="text-xs font-bold text-soopi-600 hover:text-soopi-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Xem tất cả đơn</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                          <tr>
                            <th className="py-3 px-4">Mã đơn</th>
                            <th className="py-3 px-4">Khách hàng</th>
                            <th className="py-3 px-4">Ngày đặt</th>
                            <th className="py-3 px-4">Tổng tiền</th>
                            <th className="py-3 px-4">Trạng thái</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {stats.recent_orders?.map((o) => {
                            const badge = getOrderStatusBadge(o.shipping_status);
                            return (
                              <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-gray-900">{o.order_code}</td>
                                <td className="py-3 px-4">
                                  <p className="font-semibold text-gray-800">{o.customer_name}</p>
                                  <p className="text-gray-400 text-[11px]">{o.customer_phone}</p>
                                </td>
                                <td className="py-3 px-4 text-gray-500">{formatDate(o.created_at)}</td>
                                <td className="py-3 px-4 font-black text-gray-900">{formatVND(o.total_amount)}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedOrderForDetail(o)}
                                    className="px-2.5 py-1 bg-gray-100 hover:bg-orange-50 hover:text-soopi-600 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                  >
                                    Chi tiết
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Product Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc ngành hàng..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    setSelectedProductForEdit(null);
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2.5 bg-soopi-500 hover:bg-soopi-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Sản Phẩm Vào Kệ Hàng</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loadingProducts ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Đang tải danh sách sản phẩm...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">Không tìm thấy sản phẩm nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4">Sản phẩm</th>
                          <th className="py-3 px-4">Danh mục</th>
                          <th className="py-3 px-4">Giá bán</th>
                          <th className="py-3 px-4">Trạng thái kệ hàng</th>
                          <th className="py-3 px-4">Đã bán</th>
                          <th className="py-3 px-4">Nhãn</th>
                          <th className="py-3 px-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3 max-w-sm">
                                <img src={p.image_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 border border-gray-100" />
                                <div>
                                  <p className="font-bold text-gray-900 line-clamp-1">{p.name}</p>
                                  <p className="text-gray-400 font-mono text-[10px]">ID: #{p.id} • {p.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]">
                                {p.category_name || 'Khác'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-black text-soopi-600 block">{formatVND(p.price)}</span>
                              {p.original_price && (
                                <span className="text-[10px] text-gray-400 line-through">{formatVND(p.original_price)}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {p.stock > 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Trên kệ: {p.stock}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  Hết trên kệ
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-500 font-semibold">{p.sold_count || 0}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1 flex-wrap">
                                {p.is_featured === 1 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Hot</span>
                                )}
                                {p.is_new === 1 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Mới</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedProductForEdit(p);
                                    setShowProductModal(true);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-soopi-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order filters & search */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: 'Chờ xác nhận' },
                    { id: 'confirmed', label: 'Đã xác nhận' },
                    { id: 'shipping', label: 'Đang giao' },
                    { id: 'delivered', label: 'Đã giao' },
                    { id: 'cancelled', label: 'Đã hủy' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilterStatus(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderFilterStatus === f.id
                          ? 'bg-soopi-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                      placeholder="Mã đơn / tên / SĐT khách..."
                      className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs outline-none w-60"
                    />
                  </div>

                  <button
                    onClick={() => loadOrders()}
                    disabled={loadingOrders}
                    className="p-2 bg-gray-100 hover:bg-orange-50 hover:text-soopi-600 text-gray-600 rounded-xl transition-colors cursor-pointer"
                    title="Tải lại danh sách đơn hàng"
                  >
                    <RotateCcw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loadingOrders ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Đang tải danh sách đơn hàng...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">Không có đơn hàng nào phù hợp</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4">Mã đơn hàng</th>
                          <th className="py-3 px-4">Khách hàng</th>
                          <th className="py-3 px-4">Thời gian</th>
                          <th className="py-3 px-4">Món hàng</th>
                          <th className="py-3 px-4">Tổng tiền</th>
                          <th className="py-3 px-4">Trạng thái</th>
                          <th className="py-3 px-4 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((o) => {
                          const badge = getOrderStatusBadge(o.shipping_status);
                          return (
                            <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-gray-900">{o.order_code}</td>
                              <td className="py-3 px-4">
                                <p className="font-semibold text-gray-800">{o.customer_name}</p>
                                <p className="text-gray-400 text-[11px]">{o.customer_phone}</p>
                              </td>
                              <td className="py-3 px-4 text-gray-500">{formatDate(o.created_at)}</td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-gray-700">{o.items?.length || 0} sản phẩm</span>
                              </td>
                              <td className="py-3 px-4 font-black text-gray-900">{formatVND(o.total_amount)}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                  {badge.label}
                                </span>
                                {o.shipping_status === 'cancelled' && (
                                  <div className="mt-1 text-[10px] text-red-600 max-w-[190px] leading-tight" title={o.cancel_reason || 'Không rõ lý do'}>
                                    <span className="font-semibold block truncate">Lý do: {o.cancel_reason || 'Không có lý do'}</span>
                                    <span className="text-gray-400">({o.cancelled_by === 'customer' ? 'Khách hủy' : 'Admin hủy'})</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {o.shipping_status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(o.id, 'confirmed')}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                        title="Duyệt đơn hàng này"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Duyệt</span>
                                      </button>
                                      <button
                                        onClick={() => setOrderToCancel(o)}
                                        className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                        title="Hủy đơn hàng"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Hủy</span>
                                      </button>
                                    </>
                                  )}

                                  {o.shipping_status === 'confirmed' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(o.id, 'shipping')}
                                        className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                      >
                                        <Truck className="w-3.5 h-3.5" />
                                        <span>Giao hàng</span>
                                      </button>
                                      <button
                                        onClick={() => setOrderToCancel(o)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Hủy đơn"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {o.shipping_status === 'shipping' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'delivered', 'paid')}
                                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                      Đã giao
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setSelectedOrderForDetail(o)}
                                    className="p-1.5 text-gray-500 hover:text-soopi-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                    title="Xem chi tiết"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              {/* Customer Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Tìm theo tên, email hoặc SĐT khách..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loadingCustomers ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Đang tải danh sách khách hàng...</p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">Không tìm thấy khách hàng nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4">Khách hàng</th>
                          <th className="py-3 px-4">Số điện thoại</th>
                          <th className="py-3 px-4">Địa chỉ</th>
                          <th className="py-3 px-4">Tổng đơn</th>
                          <th className="py-3 px-4">Tổng chi tiêu</th>
                          <th className="py-3 px-4">Trạng thái</th>
                          <th className="py-3 px-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredCustomers.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-soopi-500 text-white font-bold flex items-center justify-center uppercase text-xs">
                                  {c.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{c.name}</p>
                                  <p className="text-gray-400 text-[11px]">{c.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-700">{c.phone || 'Chưa cập nhật'}</td>
                            <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{c.address || 'Chưa cập nhật'}</td>
                            <td className="py-3 px-4 font-bold text-gray-900">{c.order_count || 0} đơn</td>
                            <td className="py-3 px-4 font-black text-emerald-600">{formatVND(c.total_spent)}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {c.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewCustomerOrders(c)}
                                  className="px-2.5 py-1 bg-gray-100 hover:bg-orange-50 hover:text-soopi-600 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Lịch sử đơn
                                </button>

                                <button
                                  onClick={() => handleToggleCustomerStatus(c)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    c.status === 'active'
                                      ? 'text-red-500 hover:bg-red-50'
                                      : 'text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={c.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                >
                                  {c.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <ProductFormModal
          product={selectedProductForEdit}
          categories={categories}
          onClose={() => setShowProductModal(false)}
          onSaved={() => {
            setShowProductModal(false);
            showNotice(selectedProductForEdit ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm mới thành công');
            loadProducts();
          }}
        />
      )}

      {/* MODAL 2: ADMIN ORDER DETAIL */}
      {selectedOrderForDetail && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          onClose={() => setSelectedOrderForDetail(null)}
          onStatusUpdated={(newStatus, payment) => {
            handleUpdateOrderStatus(selectedOrderForDetail.id, newStatus, payment);
          }}
          onOpenCancel={(ord) => setOrderToCancel(ord)}
        />
      )}

      {/* MODAL 2.5: CANCEL ORDER WITH REASON */}
      {orderToCancel && (
        <AdminCancelOrderModal
          order={orderToCancel}
          onClose={() => setOrderToCancel(null)}
          onConfirm={(reason) => handleConfirmCancelOrder(reason)}
          cancelling={cancellingOrder}
        />
      )}

      {/* MODAL 3: CUSTOMER ORDERS LIST */}
      {customerOrdersModal && (
        <CustomerOrdersModal
          data={customerOrdersModal}
          onClose={() => setCustomerOrdersModal(null)}
        />
      )}
    </div>
  );
}

// Subcomponent: Admin Cancel Order Modal with Reason
function AdminCancelOrderModal({ order, onClose, onConfirm, cancelling }) {
  const [reason, setReason] = useState('');
  const quickReasons = [
    'Sản phẩm tạm thời hết hàng / ngưng sản xuất',
    'Không thể liên hệ được với người nhận qua số điện thoại',
    'Địa chỉ giao hàng nằm ngoài vùng phục vụ',
    'Khách hàng gọi điện yêu cầu hủy đơn',
    'Thông tin đặt hàng có dấu hiệu không chính xác',
  ];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-sm">Hủy Đơn Hàng {order.order_code}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onConfirm(reason); }} className="p-5 space-y-4 text-xs">
          <div>
            <p className="text-gray-600 mb-2">
              Vui lòng nhập lý do hủy đơn. Lý do này sẽ được <b>hiển thị cho khách hàng</b> khi tra cứu đơn hàng:
            </p>

            <div className="space-y-1.5 mb-3">
              <span className="text-[11px] text-gray-400 font-semibold block">Gợi ý lý do nhanh:</span>
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setReason(qr)}
                  className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                    reason === qr
                      ? 'border-red-400 bg-red-50 text-red-800 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {qr}
                </button>
              ))}
            </div>

            <label className="block font-semibold text-gray-700 mb-1">Hoặc nhập lý do chi tiết *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do hủy để thông báo đến khách hàng..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={cancelling || !reason.trim()}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {cancelling ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Add / Edit Product Modal - Kệ Hàng Soopi
const CRAFT_PRESETS = [
  {
    shortTitle: 'Ấm chén Bát Tràng',
    name: 'Bộ Ấm Chén Tử Sa Bát Tràng Men Hỏa Biến',
    price: 650000,
    original_price: 850000,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    description: 'Chế tác từ đất tử sa Bát Tràng nung ở nhiệt độ 1300 độ C. Nước men hỏa biến tự nhiên biến ảo theo nhiệt độ lò, giữ trọn hương vị trà thượng hạng.',
    is_featured: 1,
    is_new: 1
  },
  {
    shortTitle: 'Khăn lụa Vạn Phúc',
    name: 'Khăn Lụa Tơ Tằm Vạn Phúc Dệt Hoa Văn Hoa Sen',
    price: 480000,
    original_price: 600000,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800',
    description: 'Dệt 100% từ tơ tằm tự nhiên tại làng lụa Vạn Phúc (Hà Đông). Hoa văn hoa sen chìm tinh xảo, bề mặt mềm mại, óng ả và thân thiện với làn da.',
    is_featured: 1,
    is_new: 1
  },
  {
    shortTitle: 'Nón bài thơ xứ Huế',
    name: 'Nón Lá Bài Thơ Xứ Huế Chằm Thủ Công',
    price: 220000,
    original_price: 280000,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800',
    description: 'Nón bài thơ truyền thống do nghệ nhân làng Tây Hồ (Huế) chằm thủ công tỉ mỉ. Khi soi lên ánh sáng sẽ thấy bài thơ và hình ảnh chùa Thiên Mụ ẩn hiện.',
    is_featured: 0,
    is_new: 1
  },
  {
    shortTitle: 'Khay mây Phú Vinh',
    name: 'Khay Trà Mây Tre Đan Xuất Khẩu Phú Vinh',
    price: 290000,
    original_price: 350000,
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    description: 'Sử dụng mây và tre cật bánh tẻ đã qua xử lý luộc sấy chống mối mọt. Đan cài hoa văn tinh xảo, phù hợp bày biện phòng khách và bàn trà thiền.',
    is_featured: 1,
    is_new: 1
  },
  {
    shortTitle: 'Hộp sơn mài Hạ Thái',
    name: 'Hộp Đựng Trang Sức Sơn Mài Cẩn Trứng Hạ Thái',
    price: 550000,
    original_price: 700000,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    description: 'Quy trình sơn mài truyền thống 12 lớp mài nước bóng láng. Kỹ thuật cẩn vỏ trứng độc đáo tạo nên bức họa hoa mai thanh tao và sang trọng.',
    is_featured: 1,
    is_new: 0
  }
];

function ProductFormModal({ product, categories, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || (categories[0]?.id || ''),
    price: product?.price || '',
    original_price: product?.original_price || '',
    stock: product?.stock !== undefined ? product.stock : 50,
    image_url: product?.image_url || '',
    description: product?.description || '',
    is_featured: product?.is_featured || 0,
    is_new: product?.is_new || 1,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      price: preset.price,
      original_price: preset.original_price,
      stock: preset.stock,
      image_url: preset.image_url,
      description: preset.description,
      is_featured: preset.is_featured,
      is_new: preset.is_new,
      category_id: prev.category_id || (categories[0]?.id || '')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Vui lòng nhập tên sản phẩm');
    if (!formData.price) return setError('Vui lòng nhập giá bán');
    if (!formData.image_url.trim()) return setError('Vui lòng nhập đường dẫn hình ảnh');

    setSaving(true);
    try {
      if (product) {
        await api.admin.updateProduct(product.id, formData);
      } else {
        await api.admin.createProduct(formData);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Lỗi lưu sản phẩm vào kệ hàng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-soopi-600 to-orange-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {product ? 'Chỉnh Sửa Sản Phẩm Trên Kệ Hàng' : 'Thêm Sản Phẩm Mới Vào Kệ Hàng'}
              </h2>
              <p className="text-xs text-gray-500">
                {product ? 'Cập nhật thông tin và số lượng bày bán trên kệ' : 'Điền thông tin để đưa mặt hàng thủ công lên kệ hàng Soopi'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Mẫu điền nhanh cho sản phẩm mới */}
          {!product && (
            <div className="p-3 bg-orange-50/80 border border-orange-200/60 rounded-2xl">
              <p className="text-[11px] font-bold text-soopi-800 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-soopi-600" />
                <span>Gợi ý mẫu sản phẩm thủ công (Bấm để điền nhanh):</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CRAFT_PRESETS.map((preset) => (
                  <button
                    key={preset.shortTitle}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100 text-gray-700 hover:text-soopi-700 text-[11px] font-semibold rounded-lg border border-orange-200/80 shadow-2xs transition-colors cursor-pointer"
                  >
                    + {preset.shortTitle}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tên sản phẩm thủ công *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bộ Ấm Chén Tử Sa Bát Tràng..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-gray-900 outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Danh mục làng nghề *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none text-xs bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Số lượng đưa lên kệ hàng *</label>
              <input
                type="number"
                min="0"
                required
                placeholder="50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Giá bán trên kệ (VND) *</label>
              <input
                type="number"
                min="1000"
                required
                placeholder="Ví dụ: 350000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Giá gốc gạch ngang (VND)</label>
              <input
                type="number"
                placeholder="Ví dụ: 450000"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : '' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Đường dẫn hình ảnh (URL) *</label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none font-mono text-xs"
              />
              {formData.image_url && (
                <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Câu chuyện làng nghề & Mô tả chi tiết</label>
            <textarea
              rows={3}
              placeholder="Mô tả nguồn gốc, chất liệu tự nhiên, quy trình chế tác thủ công..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none text-xs"
            />
          </div>

          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured === 1}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                className="rounded text-soopi-600 focus:ring-soopi-500"
              />
              <span className="font-semibold text-gray-800">Đặt làm sản phẩm Nổi Bật trên kệ</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new === 1}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked ? 1 : 0 })}
                className="rounded text-soopi-600 focus:ring-soopi-500"
              />
              <span className="font-semibold text-gray-800">Gắn nhãn Hàng Mới về</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-soopi-500 hover:bg-soopi-600 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đưa lên kệ...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{product ? 'Cập Nhật Kệ Hàng' : 'Đưa Sản Phẩm Lên Kệ Hàng'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Admin Order Detail & Status Modifier Modal
function OrderDetailModal({ order, onClose, onStatusUpdated, onOpenCancel }) {
  const badge = getOrderStatusBadge(order.shipping_status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[11px] text-gray-400 font-mono">Chi tiết đơn hàng</span>
            <h2 className="text-base font-black text-gray-900">{order.order_code}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Cancellation reason box (if cancelled) */}
          {order.shipping_status === 'cancelled' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900">
              <div className="flex items-center gap-2 font-bold text-red-700 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Đơn hàng đã bị hủy</span>
              </div>
              <p className="text-red-800">
                <b>Lý do hủy:</b> {order.cancel_reason || 'Không có lý do cụ thể'}
              </p>
              <p className="text-[11px] text-red-600 mt-1">
                Hủy bởi: <b>{order.cancelled_by === 'customer' ? 'Khách hàng yêu cầu hủy' : 'Quản trị viên (Shop)'}</b>
              </p>
            </div>
          )}

          {/* Quick status bar */}
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-gray-400 block">Trạng thái hiện tại:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-1 ${badge.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                {badge.label}
              </span>
            </div>

            {/* Change Status Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-gray-500 font-semibold">Thao tác:</span>

              {order.shipping_status === 'pending' && (
                <>
                  <button
                    onClick={() => onStatusUpdated('confirmed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Duyệt đơn</span>
                  </button>
                  <button
                    onClick={() => onOpenCancel(order)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy đơn hàng</span>
                  </button>
                </>
              )}

              {order.shipping_status === 'confirmed' && (
                <>
                  <button
                    onClick={() => onStatusUpdated('shipping')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Giao hàng</span>
                  </button>
                  <button
                    onClick={() => onOpenCancel(order)}
                    className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Hủy đơn
                  </button>
                </>
              )}

              {order.shipping_status === 'shipping' && (
                <>
                  <button
                    onClick={() => onStatusUpdated('delivered', 'paid')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Đã giao & thu tiền</span>
                  </button>
                  <button
                    onClick={() => onOpenCancel(order)}
                    className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Hủy đơn
                  </button>
                </>
              )}

              {order.shipping_status === 'cancelled' && (
                <button
                  onClick={() => onStatusUpdated('pending')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục lại đơn</span>
                </button>
              )}
            </div>
          </div>

          {/* Delivery & Payment details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1.5">Người Nhận Hàng</h4>
              <p className="font-semibold text-gray-800">{order.customer_name}</p>
              <p className="text-gray-500">{order.customer_phone}</p>
              <p className="text-gray-500 mt-1">{order.customer_address}</p>
              {order.customer_note && <p className="text-gray-400 italic mt-1">Ghi chú: {order.customer_note}</p>}
            </div>

            <div className="p-4 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1.5">Thông Tin Thanh Toán</h4>
              <p className="text-gray-600">Hình thức: <b className="text-gray-900">{order.payment_method}</b></p>
              <p className="text-gray-600">Trạng thái: <b className={order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</b></p>
              <p className="text-gray-600 mt-1">Thời gian tạo: <b className="text-gray-900">{formatDate(order.created_at)}</b></p>
            </div>
          </div>

          {/* Item details */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-2">Chi Tiết Sản Phẩm Trong Đơn</h4>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {order.items?.map((it) => (
                <div key={it.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={it.product_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-gray-800">{it.product_name}</p>
                      <p className="text-gray-400 text-[11px]">{formatVND(it.price)} x {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">{formatVND(it.total)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between font-black text-sm text-gray-900 px-2">
              <span>Tổng Tiền Đơn Hàng:</span>
              <span className="text-base text-soopi-600">{formatVND(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Customer Orders History Modal
function CustomerOrdersModal({ data, onClose }) {
  const { customer, orders } = data;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Lịch Sử Mua Hàng của Khách Hàng</h2>
            <p className="text-xs text-gray-500">{customer.name} ({customer.email})</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">Khách hàng này chưa có đơn hàng nào.</p>
          ) : (
            orders.map((o) => {
              const badge = getOrderStatusBadge(o.shipping_status);
              return (
                <div key={o.id} className="p-3.5 border border-gray-100 rounded-xl bg-gray-50 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-gray-900">{o.order_code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>{formatDate(o.created_at)}</span>
                    <span className="font-black text-gray-900">{formatVND(o.total_amount)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


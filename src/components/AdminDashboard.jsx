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
  Tag
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

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = {};
      if (orderFilterStatus !== 'all') params.status = orderFilterStatus;
      if (orderSearch.trim()) params.q = orderSearch.trim();
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
      showNotice('Cập nhật trạng thái đơn hàng thành công');
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
            <span>Quản Lý Sản Phẩm</span>
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
                              handleTabChange('orders');
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
                  <span>Thêm Sản Phẩm Mới</span>
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
                          <th className="py-3 px-4">Kho</th>
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
                              <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                                {p.stock}
                              </span>
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
                      onClick={() => {
                        setOrderFilterStatus(f.id);
                        setTimeout(loadOrders, 0);
                      }}
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

                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                    placeholder="Mã đơn / tên / SĐT khách..."
                    className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-xs outline-none w-64"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loadingOrders ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Đang tải danh sách đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
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
                        {orders.map((o) => {
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
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {o.shipping_status === 'pending' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'confirmed')}
                                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                      Xác nhận
                                    </button>
                                  )}

                                  {o.shipping_status === 'confirmed' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'shipping')}
                                      className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                      Giao hàng
                                    </button>
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

// Subcomponent: Add / Edit Product Modal
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
      setError(err.message || 'Lỗi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            {product ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-gray-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Danh mục *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Số lượng kho *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Giá bán hiện tại (VND) *</label>
              <input
                type="number"
                min="1000"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Giá gốc gạch ngang (VND)</label>
              <input
                type="number"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : '' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Đường dẫn hình ảnh (URL) *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Mô tả sản phẩm chi tiết</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-soopi-500 text-gray-900 outline-none"
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
              <span className="font-semibold text-gray-800">Đặt làm sản phẩm Nổi Bật</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new === 1}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked ? 1 : 0 })}
                className="rounded text-soopi-600 focus:ring-soopi-500"
              />
              <span className="font-semibold text-gray-800">Gắn nhãn Hàng Mới</span>
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
              className="px-5 py-2.5 rounded-xl bg-soopi-500 hover:bg-soopi-600 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Admin Order Detail & Status Modifier Modal
function OrderDetailModal({ order, onClose, onStatusUpdated }) {
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
              <span className="text-[11px] text-gray-500 font-semibold">Chuyển sang:</span>
              <button
                onClick={() => onStatusUpdated('confirmed')}
                className="px-2.5 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg font-bold text-[11px] cursor-pointer"
              >
                Đã xác nhận
              </button>
              <button
                onClick={() => onStatusUpdated('shipping')}
                className="px-2.5 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg font-bold text-[11px] cursor-pointer"
              >
                Đang giao
              </button>
              <button
                onClick={() => onStatusUpdated('delivered', 'paid')}
                className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg font-bold text-[11px] cursor-pointer"
              >
                Đã giao & thu tiền
              </button>
              <button
                onClick={() => onStatusUpdated('cancelled')}
                className="px-2.5 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg font-bold text-[11px] cursor-pointer"
              >
                Hủy đơn
              </button>
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


import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BannerSlider from './components/BannerSlider';
import CategoryGrid from './components/CategoryGrid';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import TrackOrderModal from './components/TrackOrderModal';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { api } from './api/client';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { 
  Sparkles, 
  Flame, 
  Filter, 
  ArrowUpDown, 
  Search, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  PackageX
} from 'lucide-react';

export default function App() {
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();

  // Navigation View ('home' | 'products')
  const [currentView, setCurrentView] = useState('home');

  // Data states
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular' | 'price_asc' | 'price_desc'

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [trackOrderCode, setTrackOrderCode] = useState('');
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload products whenever filters change
  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const loadInitialData = async () => {
    try {
      const [bannersRes, categoriesRes] = await Promise.all([
        api.getBanners(),
        api.getCategories(),
      ]);
      if (bannersRes.success) setBanners(bannersRes.banners || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories || []);
    } catch (err) {
      console.error('Failed to load initial metadata:', err);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = {
        q: searchQuery,
        category: selectedCategory,
        min_price: priceRange.min,
        max_price: priceRange.max,
        sort: sortBy,
      };
      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('products');
  };

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    if (slug) {
      setCurrentView('products');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
  };

  const handleTrackSpecificOrder = (code) => {
    setTrackOrderCode(code);
    setShowTrackModal(true);
  };

  // Filtered subsets for Homepage
  const featuredProducts = products.filter((p) => p.is_featured === 1);
  const newProducts = products.filter((p) => p.is_new === 1);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* 1. Header Navigation */}
      <Navbar
        onSearch={handleSearch}
        searchQuery={searchQuery}
        currentView={currentView}
        onNavigateHome={() => {
          setCurrentView('home');
          handleClearFilters();
        }}
        onNavigateProducts={() => setCurrentView('products')}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenTrack={() => {
          setTrackOrderCode('');
          setShowTrackModal(true);
        }}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* HOMEPAGE VIEW */}
        {currentView === 'home' && (
          <div>
            {/* Hero Carousel Banner */}
            <BannerSlider
              banners={banners}
              onBannerClick={(banner) => {
                setCurrentView('products');
              }}
            />

            {/* Category Grid */}
            <CategoryGrid
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />

            {/* Flash Sale / Featured Products Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-orange-500/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">SẢN PHẨM NỔI BẬT & BÁN CHẠY</h2>
                      <p className="text-xs text-orange-100">Top deal siêu hot được khách hàng săn đón nhiều nhất hôm nay</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSortBy('popular');
                      setCurrentView('products');
                    }}
                    className="px-4 py-2 bg-white text-soopi-600 hover:bg-orange-50 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem tất cả Deal</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loadingProducts ? (
                <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs">Đang tải sản phẩm nổi bật...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8)).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* New Arrivals Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Hàng Mới Về Tuần Này
                  </h2>
                  <p className="text-xs text-gray-500">Cập nhật công nghệ, thiết bị và thời trang xu hướng mới nhất</p>
                </div>

                <button
                  onClick={() => {
                    setSortBy('newest');
                    setCurrentView('products');
                  }}
                  className="text-xs font-bold text-soopi-600 hover:text-soopi-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem thêm hàng mới</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {(newProducts.length > 0 ? newProducts : products.slice(0, 8)).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* PRODUCTS CATALOG VIEW */}
        {currentView === 'products' && (
          <div className="space-y-6">
            {/* Breadcrumb & Title */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <span onClick={() => setCurrentView('home')} className="hover:text-soopi-600 cursor-pointer">Trang chủ</span>
                  <span>/</span>
                  <span className="text-gray-700 font-semibold">Tất cả sản phẩm</span>
                  {selectedCategory && (
                    <>
                      <span>/</span>
                      <span className="text-soopi-600 font-bold capitalize">
                        {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : 'Tất Cả Sản Phẩm'}
                  <span className="text-xs font-normal text-gray-400 ml-2">({products.length} sản phẩm)</span>
                </h1>
              </div>

              {(searchQuery || selectedCategory || priceRange.min || priceRange.max) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Filter and Sort Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
              {/* Category Dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-700">Danh mục:</span>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-gray-50 focus:border-soopi-500 outline-none cursor-pointer"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.product_count || 0})
                    </option>
                  ))}
                </select>

                {/* Price range filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-gray-700 ml-2">Khoảng giá (₫):</span>
                  <input
                    type="number"
                    placeholder="Tối thiểu"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-24 px-2 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-soopi-500 bg-gray-50"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Tối đa"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-24 px-2 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-soopi-500 bg-gray-50"
                  />
                </div>
              </div>

              {/* Sort By Buttons */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-700">Sắp xếp:</span>
                <div className="flex gap-1">
                  {[
                    { id: 'newest', label: 'Mới nhất' },
                    { id: 'popular', label: 'Bán chạy' },
                    { id: 'price_asc', label: 'Giá tăng dần' },
                    { id: 'price_desc', label: 'Giá giảm dần' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        sortBy === s.id
                          ? 'bg-soopi-500 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                <div className="w-8 h-8 border-3 border-soopi-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-xs">Đang tìm kiếm sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <PackageX className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <h3 className="text-base font-bold text-gray-800">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
                  Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc giá và danh mục hiện tại.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-soopi-500 hover:bg-soopi-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={() => setShowCheckoutModal(true)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setShowCheckoutModal(true)}
      />

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          onClose={() => setShowCheckoutModal(false)}
          onOrderPlaced={(order) => {
            setPlacedOrder(order);
          }}
        />
      )}

      {/* Order Success Celebration Modal */}
      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
          onTrackOrder={(code) => handleTrackSpecificOrder(code)}
        />
      )}

      {/* Track Order Modal */}
      {showTrackModal && (
        <TrackOrderModal
          initialCode={trackOrderCode}
          onClose={() => {
            setShowTrackModal(false);
            setTrackOrderCode('');
          }}
        />
      )}

      {/* Customer Profile & Orders History Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onTrackOrder={(code) => handleTrackSpecificOrder(code)}
        />
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {}}
        />
      )}

      {/* Admin Management Dashboard */}
      {showAdminModal && (
        <AdminDashboard
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {/* Footer */}
      <Footer onOpenAdmin={() => setShowAdminModal(true)} />

      {/* Chatbot AI - nổi góc phải */}
      <ChatBot onAddToCart={(product) => addToCart(product, 1)} />
    </div>
  );
}


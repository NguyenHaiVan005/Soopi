import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  User, 
  ShieldCheck, 
  LogOut, 
  Package, 
  MapPin, 
  HelpCircle,
  Truck,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ 
  onSearch, 
  searchQuery, 
  onOpenAuth, 
  onOpenProfile, 
  onOpenTrack, 
  onOpenAdmin,
  currentView,
  onNavigateHome,
  onNavigateProducts
}) {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput.trim());
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top micro bar */}
      <div className="bg-gradient-to-r from-orange-600 via-soopi-500 to-orange-500 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 font-medium">
              <Truck className="w-3.5 h-3.5" /> Miễn phí vận chuyển đơn từ 0Đ
            </span>
            <span className="hidden md:inline-block text-orange-200">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Cam kết 100% hàng chính hãng
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onOpenTrack}
              className="flex items-center gap-1 hover:text-orange-100 transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" /> Tra cứu đơn hàng
            </button>
            <span className="text-orange-200">|</span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Hotline: 1900 6868
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-soopi-600 to-orange-400 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-gray-900 flex items-center">
                Soo<span className="text-soopi-500">pi</span>
                <span className="ml-1 text-[10px] font-bold uppercase bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded tracking-wider">VN</span>
              </span>
              <p className="text-[10px] text-gray-500 font-medium -mt-1 hidden sm:block">Sàn thương mại điện tử</p>
            </div>
          </div>

          {/* Search Form */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl relative"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
                className="w-full bg-gray-100 focus:bg-white text-gray-900 pl-4 pr-24 py-2.5 rounded-full border border-gray-200 focus:border-soopi-500 focus:ring-2 focus:ring-soopi-500/20 text-sm outline-none transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="absolute right-1 px-4 py-1.5 bg-soopi-500 hover:bg-soopi-600 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Navigation Links */}
            <button
              onClick={onNavigateProducts}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer hidden lg:inline-flex items-center ${
                currentView === 'products' ? 'text-soopi-600 bg-orange-50 font-semibold' : 'text-gray-700 hover:text-soopi-600 hover:bg-gray-100'
              }`}
            >
              Tất cả sản phẩm
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-700 hover:text-soopi-500 hover:bg-orange-50 rounded-full transition-all cursor-pointer"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-soopi-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-gray-200 hover:border-soopi-400 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-soopi-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-gray-800 max-w-[100px] truncate leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-500 leading-tight">
                        {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown popup */}
                  {showUserDropdown && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500">Đăng nhập với tư cách</p>
                        <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={onOpenAdmin}
                          className="w-full text-left px-4 py-2 text-soopi-600 hover:bg-orange-50 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-soopi-500" />
                          Trang Quản Trị (Admin)
                        </button>
                      )}

                      <button
                        onClick={onOpenProfile}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Tài khoản của tôi
                      </button>

                      <button
                        onClick={onOpenProfile}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        Lịch sử đơn hàng
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-soopi-600 text-gray-800 text-xs font-semibold transition-all cursor-pointer border border-gray-200"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


import React from 'react';
import { ShoppingBag, ShieldCheck, Heart, Cloud, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onOpenAdmin }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20 pt-12 pb-8 text-xs text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-soopi-600 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Soo<span className="text-soopi-500">pi</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              Soopi là nền tảng thương mại điện tử hàng đầu mang đến trải nghiệm mua sắm thông minh, an toàn và ngập tràn ưu đãi. Hỗ trợ thanh toán khi nhận hàng (COD) và bảo vệ người mua 100%.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold border border-orange-200/60">
                <Cloud className="w-3.5 h-3.5 text-orange-500" />
                Sẵn sàng triển khai trên Cloudflare Edge
              </span>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Chăm Sóc Khách Hàng</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Trung Tâm Trợ Giúp</a></li>
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Hướng Dẫn Mua Hàng</a></li>
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Chính Sách Đổi Trả 7 Ngày</a></li>
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Phương Thức Thanh Toán COD</a></li>
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Vận Chuyển & Giao Nhận</a></li>
            </ul>
          </div>

          {/* About Soopi */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Về Soopi Việt Nam</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Giới Thiệu Về Soopi</a></li>
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Tuyển Dụng Tài Năng</a></li>
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Điều Khoản Dịch Vụ</a></li>
              <li><a href="#" className="hover:text-soopi-600 transition-colors">Chính Sách Bảo Mật</a></li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-soopi-600 hover:text-soopi-700 font-bold transition-colors cursor-pointer text-left"
                >
                  Cổng Quản Trị Hệ Thống (Admin)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Liên Hệ & Trụ Sở</h4>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>Keangnam Landmark 72, Nam Từ Liêm, Hà Nội</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>1900 6868 (8:00 - 21:00)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>support@soopi.vn</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© 2026 Soopi E-commerce Platform. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-gray-400">Thiết kế chuẩn thương mại điện tử hiện đại</span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Bảo Mật SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}


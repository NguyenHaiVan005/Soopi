import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, RefreshCw, Truck, Tag } from 'lucide-react';

export default function BannerSlider({ banners = [], onBannerClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative mb-8">
      {/* Main Banner Slider Container */}
      <div className="relative h-48 sm:h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg group">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-100 group-hover:scale-105"
          style={{ backgroundImage: `url(${currentBanner.image_url})` }}
        >
          {/* Vibrant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/40 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center text-white z-10">
          <div className="max-w-xl">
            {currentBanner.badge_text && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-soopi-500 text-white shadow-sm mb-3">
                <Zap className="w-3.5 h-3.5" />
                {currentBanner.badge_text}
              </span>
            )}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2 sm:mb-3 drop-shadow">
              {currentBanner.title}
            </h2>
            <p className="text-xs sm:text-base text-gray-200 line-clamp-2 mb-4 sm:mb-6 drop-shadow">
              {currentBanner.subtitle}
            </p>
            <button
              onClick={() => onBannerClick && onBannerClick(currentBanner)}
              className="px-5 py-2.5 sm:px-7 sm:py-3 bg-white text-soopi-600 hover:bg-orange-50 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              Khám Phá Ngay
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/40 hover:bg-white text-gray-800 flex items-center justify-center transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/40 hover:bg-white text-gray-800 flex items-center justify-center transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                index === currentIndex ? 'w-8 bg-soopi-500' : 'w-2 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Promotional Perks Under Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-soopi-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Freeship Toàn Quốc</h4>
            <p className="text-[11px] text-gray-500">Đơn từ 0Đ mọi ngày</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Chính Hãng 100%</h4>
            <p className="text-[11px] text-gray-500">Đền gấp đôi nếu giả</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Đổi Trả 7 Ngày</h4>
            <p className="text-[11px] text-gray-500">Thủ tục nhanh chóng</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Giao Siêu Tốc 2H</h4>
            <p className="text-[11px] text-gray-500">Nội thành Hà Nội & HCM</p>
          </div>
        </div>
      </div>
    </div>
  );
}


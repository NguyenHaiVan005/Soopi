import React, { useState } from 'react';
import { X, Star, ShoppingCart, Truck, ShieldCheck, RefreshCw, Plus, Minus, Zap } from 'lucide-react';
import { formatVND } from '../utils/format';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, onClose, onBuyNow }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.image_url);
  const [showToast, setShowToast] = useState(false);

  if (!product) return null;

  let images = [product.image_url];
  try {
    if (product.images_json) {
      const parsed = JSON.parse(product.images_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed;
      }
    }
  } catch (e) {
    images = [product.image_url];
  }

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock || 1, prev + 1));
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleBuyNowClick = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    onClose();
    if (onBuyNow) onBuyNow();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Đã thêm {quantity} sản phẩm vào giỏ hàng thành công!
        </div>
      )}

      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Gallery */}
          <div className="p-6 bg-gray-50 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-inner mb-4 flex items-center justify-center">
              <img
                src={selectedImage || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === img ? 'border-soopi-500 scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200 text-center text-[11px] text-gray-600">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-orange-500" />
                <span>Giao hàng 0Đ</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Chính hãng</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span>Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-soopi-600">
                  {product.category_name || 'Sản phẩm'}
                </span>
                {product.is_featured === 1 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Bán Chạy Nhất
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-snug">
                {product.name}
              </h1>

              {/* Rating & Sold count */}
              <div className="flex items-center gap-3 text-sm pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 stroke-none" />
                  <span>{product.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 text-xs">
                  {product.reviews_count || 48} Đánh giá
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 text-xs">
                  Đã bán {product.sold_count || 0}
                </span>
              </div>

              {/* Price Block */}
              <div className="my-5 p-4 rounded-2xl bg-orange-50/70 border border-orange-100/80 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-soopi-600">
                  {formatVND(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatVND(product.original_price)}
                    </span>
                    <span className="text-xs font-extrabold text-white bg-soopi-500 px-2 py-0.5 rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Mô tả sản phẩm</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto pr-2">
                  {product.description || 'Sản phẩm chính hãng với bảo hành đầy đủ, đóng gói cẩn thận và giao hàng siêu tốc.'}
                </p>
              </div>

              {/* Stock status & Quantity selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Số lượng</span>
                  <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Đã hết hàng'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      onClick={handleDecrease}
                      disabled={quantity <= 1 || product.stock <= 0}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-soopi-600 disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock || product.stock <= 0}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-soopi-600 disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3 px-4 rounded-xl border-2 border-soopi-500 text-soopi-600 hover:bg-orange-50 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Thêm vào giỏ
              </button>

              <button
                onClick={handleBuyNowClick}
                disabled={product.stock <= 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-soopi-500 to-orange-500 hover:from-soopi-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


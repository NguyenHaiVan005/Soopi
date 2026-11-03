import React from 'react';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { formatVND } from '../utils/format';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer relative"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.is_featured === 1 && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              NỔI BẬT
            </span>
          )}
          {product.is_new === 1 && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              MỚI
            </span>
          )}
        </div>

        {/* Discount Ribbon */}
        {discountPercent && (
          <div className="absolute top-2.5 right-2.5 bg-soopi-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Stock Out Overlay if stock <= 0 */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          {product.category_name && (
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              {product.category_name}
            </span>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-soopi-600 transition-colors mb-2 leading-snug">
            {product.name}
          </h3>

          {/* Ratings & Sold count */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <div className="flex items-center text-amber-500 font-semibold gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
              <span>{product.rating?.toFixed(1) || '5.0'}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-[11px]">
              Đã bán {product.sold_count > 1000 ? `${(product.sold_count / 1000).toFixed(1)}k` : (product.sold_count || 0)}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap mb-3">
            <span className="text-base sm:text-lg font-black text-soopi-600">
              {formatVND(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatVND(product.original_price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-[11px] text-gray-400">
              {product.stock > 0 ? `Còn ${product.stock} trong kho` : 'Tạm hết'}
            </span>

            <button
              onClick={handleQuickAdd}
              disabled={product.stock <= 0}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                product.stock <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-orange-50 text-soopi-600 hover:bg-soopi-500 hover:text-white shadow-sm'
              }`}
              title="Thêm nhanh vào giỏ hàng"
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


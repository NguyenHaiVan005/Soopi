import React from 'react';
import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Watch, 
  BookOpen, 
  Layers 
} from 'lucide-react';

const iconMap = {
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Watch,
  BookOpen,
};

export default function CategoryGrid({ categories = [], selectedCategory, onSelectCategory }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Danh Mục Nổi Bật</h3>
          <p className="text-xs text-gray-500">Khám phá các ngành hàng phong phú tại Soopi</p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory('')}
            className="text-xs font-semibold text-soopi-600 hover:text-soopi-700 hover:underline cursor-pointer"
          >
            Xem tất cả ngành hàng
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Layers;
          const isSelected = selectedCategory === cat.slug;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? '' : cat.slug)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border flex flex-col items-center text-center group ${
                isSelected
                  ? 'bg-orange-50/80 border-soopi-500 shadow-md ring-2 ring-soopi-500/20'
                  : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-md'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                isSelected
                  ? 'bg-soopi-500 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-orange-50 text-soopi-600 group-hover:bg-soopi-500 group-hover:text-white'
              }`}>
                <IconComponent className="w-7 h-7" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-soopi-600 transition-colors line-clamp-1 mb-1">
                {cat.name}
              </h4>
              <span className="text-[11px] text-gray-400 font-medium">
                {cat.product_count || 0} sản phẩm
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}


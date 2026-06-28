import React from "react";
import { Plus } from "lucide-react";

interface BundleItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
}

interface FrequentlyBoughtTogetherProps {
  items: BundleItem[];
}

const formatPrice = (n: number) => "৳" + n.toLocaleString("en-US");

const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-800 text-base">Frequently Buy Together</h3>
      <div className="flex flex-wrap gap-3 items-center">
        {items.map((item, i) => (
          <React.Fragment key={item.id}>
            <div className="relative bg-white border border-gray-100 rounded-2xl p-3 w-36 hover:border-orange-200 hover:shadow-md transition-all">
              <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-4/5 h-4/5 object-contain"
                />
              </div>
              <button className="absolute top-2 right-2 flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-2 py-1 rounded-lg transition-colors">
                <Plus size={10} /> Add
              </button>
              <p className="text-[11px] text-gray-600 truncate font-medium">{item.name}</p>
              <p className={`text-[11px] font-semibold ${item.inStock ? "text-emerald-600" : "text-red-500"}`}>
                {item.inStock ? "In Stock" : "Out of Stock"}
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                <span className="text-[10px] text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
              </div>
            </div>
            {i < items.length - 1 && (
              <Plus size={18} className="text-gray-300 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;
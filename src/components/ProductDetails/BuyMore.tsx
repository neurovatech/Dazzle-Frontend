import React from "react";

interface BuyMoreItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
}

interface BuyMoreProps {
  items: BuyMoreItem[];
}

const formatPrice = (n: number) => "৳" + n.toLocaleString("en-US");

const BuyMore: React.FC<BuyMoreProps> = ({ items }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-gray-800 text-base">Buy More</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-10 h-10 object-contain rounded-lg bg-gray-50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-orange-500 font-medium">
                💰 Save {formatPrice(item.originalPrice - item.price)}
              </p>
              <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyMore;
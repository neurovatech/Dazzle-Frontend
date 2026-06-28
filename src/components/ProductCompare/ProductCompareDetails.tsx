"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface Spec {
  label: string;
  value: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  specs: Spec[];
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "AirPods Pro",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&hei=400&fmt=jpeg&qlt=95",
    specs: [
      { label: "Dimensions", value: "163.4 × 78 × 8.8 mm (6.43 × 3.07 × 0.35 in)" },
      { label: "Weight", value: "385 g (13.6 oz)" },
      { label: "Chip", value: "Apple H2 chip" },
      { label: "Battery Life", value: "Up to 6 hours listening time (ANC on)" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Water Resistance", value: "IPX4 sweat and water resistant" },
    ],
  },
  {
    id: 2,
    name: "AirPods Pro 2nd Gen",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQDY3?wid=400&hei=400&fmt=jpeg&qlt=95",
    specs: [
      { label: "Dimensions", value: "163.4 × 78 × 8.8 mm (6.43 × 3.07 × 0.35 in)" },
      { label: "Weight", value: "187 g (6.6 oz)" },
      { label: "Chip", value: "Apple H2 chip" },
      { label: "Battery Life", value: "Up to 6 hours listening time (ANC on)" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Water Resistance", value: "IP54 dust and water resistant" },
    ],
  },
  {
    id: 3,
    name: "AirPods Max",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MGYN3?wid=400&hei=400&fmt=jpeg&qlt=95",
    specs: [
      { label: "Dimensions", value: "163.4 × 78 × 8.8 mm (6.43 × 3.07 × 0.35 in)" },
      { label: "Weight", value: "385 g (13.6 oz)" },
      { label: "Chip", value: "Apple H1 chip" },
      { label: "Battery Life", value: "Up to 20 hours listening time (ANC on)" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
      { label: "Water Resistance", value: "No official rating" },
    ],
  },
];

export default function ProductCompareDetails() {
  const primaryProduct = PRODUCTS[0];
  const [compareProduct, setCompareProduct] = useState<Product | null>(PRODUCTS[1]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = PRODUCTS.filter(
    (p) =>
      p.id !== primaryProduct.id &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (product: Product) => {
    setCompareProduct(product);
    setSearchQuery(product.name);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-4xl">

        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-5">Product Compare</h1>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Header Row */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-gray-600">
              Product Name :{" "}
              <span className="font-semibold text-gray-900">{primaryProduct.name}</span>
            </p>

            <div ref={dropdownRef} className="relative sm:ml-2 w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Compare With..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {showDropdown && filteredOptions.length > 0 && (
                <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {filteredOptions.map((p) => (
                    <li
                      key={p.id}
                      onMouseDown={() => handleSelect(p)}
                      className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {/* Empty label header */}
                  <th className="w-44 border-r border-gray-200" />

                  {/* Primary product image */}
                  <th className="border-r border-gray-200 py-6 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={primaryProduct.image}
                        alt={primaryProduct.name}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image";
                        }}
                      />
                    </div>
                  </th>

                  {/* Compare product image */}
                  <th className="py-6 px-4">
                    <div className="flex flex-col items-center gap-2">
                      {compareProduct ? (
                        <img
                          src={compareProduct.image}
                          alt={compareProduct.name}
                          className="w-20 h-20 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
                          <span className="text-xs text-gray-400 text-center leading-tight px-1">
                            Select a product
                          </span>
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {primaryProduct.specs.map((spec, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Label */}
                    <td className="py-4 px-6 border-r border-gray-200 w-44">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {spec.label}
                      </span>
                    </td>

                    {/* Primary value */}
                    <td className="py-4 px-6 border-r border-gray-100">
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {spec.value}
                      </span>
                    </td>

                    {/* Compare value */}
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {compareProduct
                          ? compareProduct.specs[idx]?.value
                          : <span className="text-gray-300 select-none">—</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile product name labels */}
        <div className="mt-3 grid grid-cols-2 gap-4 sm:hidden pl-44 text-xs text-center">
          <p className="font-semibold text-gray-700">{primaryProduct.name}</p>
          <p className="font-semibold text-gray-700">{compareProduct?.name ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
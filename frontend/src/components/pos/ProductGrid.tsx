"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductSearch from "./ProductSearch";
import { useCartStore } from "@/stores/cartStore";

interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
  stock: number;
  category: { name: string };
}

interface ProductGridProps {
  products: Product[];
  categories: string[];
}

export default function ProductGrid({ products, categories }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const addItem = useCartStore((s) => s.addItem);

  // Lọc sản phẩm theo search + category
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      const matchCategory =
        activeCategory === "Tất cả" || p.category.name === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, activeCategory]);

  // Xử lý quét barcode: tìm SP và thêm vào giỏ ngay
  const handleBarcodeSubmit = (barcode: string) => {
    const found = products.find((p) => p.barcode === barcode);
    if (found) {
      addItem({
        id: found.id,
        name: found.name,
        price: found.price,
        barcode: found.barcode,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search bar */}
      <ProductSearch
        onSearch={setSearchQuery}
        onBarcodeSubmit={handleBarcodeSubmit}
      />

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["Tất cả", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-sm">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

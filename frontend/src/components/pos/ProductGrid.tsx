"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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

  // === Task 4.3: Barcode Scanner Keyboard Listener ===
  // Máy quét mã vạch gửi ký tự rất nhanh (< 50ms/char) rồi kết thúc bằng Enter
  const barcodeBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBarcodeDetected = useCallback(
    (barcode: string) => {
      const found = products.find((p) => p.barcode === barcode);
      if (found) {
        addItem({
          id: found.id,
          name: found.name,
          price: found.price,
          barcode: found.barcode,
        });
      }
    },
    [products, addItem]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang focus vào input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;

      if (e.key === "Enter" && barcodeBufferRef.current.length >= 4) {
        // Enter + đủ dài = barcode scan hoàn tất
        e.preventDefault();
        handleBarcodeDetected(barcodeBufferRef.current);
        barcodeBufferRef.current = "";
        return;
      }

      // Nếu khoảng cách > 100ms = người gõ tay, reset buffer
      if (timeDiff > 100) {
        barcodeBufferRef.current = "";
      }

      // Chỉ nhận ký tự alphanumeric
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        barcodeBufferRef.current += e.key;
        lastKeyTimeRef.current = now;

        // Auto-clear buffer sau 500ms nếu không có Enter
        if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
        barcodeTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 500);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
    };
  }, [handleBarcodeDetected]);

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

  // Xử lý quét barcode từ ô input: tìm SP và thêm vào giỏ ngay
  const handleBarcodeSubmit = (barcode: string) => {
    handleBarcodeDetected(barcode);
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

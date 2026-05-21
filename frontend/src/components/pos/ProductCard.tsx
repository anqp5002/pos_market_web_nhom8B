"use client";

import { useCartStore, type CartItem } from "@/stores/cartStore";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    barcode: string;
    stock: number;
    category: { name: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    const item: Omit<CartItem, "quantity"> = {
      id: product.id,
      name: product.name,
      price: product.price,
      barcode: product.barcode,
    };
    addItem(item);
  };

  return (
    <button
      onClick={handleAdd}
      className="group relative flex flex-col bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left cursor-pointer active:scale-[0.97]"
    >
      {/* Category badge */}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full self-start mb-2">
        {product.category.name}
      </span>

      {/* Product icon placeholder */}
      <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mb-3">
        <span className="text-4xl">📦</span>
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">
        {product.name}
      </h3>

      {/* Barcode */}
      <p className="text-[10px] text-gray-400 font-mono mb-2">
        {product.barcode}
      </p>

      {/* Price & Stock */}
      <div className="mt-auto flex items-end justify-between w-full">
        <span className="text-lg font-bold text-blue-600">
          {product.price.toLocaleString("vi-VN")}₫
        </span>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            product.stock > 10
              ? "text-green-700 bg-green-50"
              : product.stock > 0
              ? "text-amber-700 bg-amber-50"
              : "text-red-700 bg-red-50"
          }`}
        >
          SL: {product.stock}
        </span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <ShoppingCart className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

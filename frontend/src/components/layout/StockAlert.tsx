"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Package } from "lucide-react";

interface LowStockProduct {
  id: number;
  name: string;
  barcode: string;
  stock: number;
  category: { name: string };
}

/**
 * Toast cảnh báo tồn kho thấp (FR-06 mở rộng)
 * Tự động kiểm tra khi mount và hiển thị toast nếu có SP sắp hết
 */
export default function StockAlert() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkLowStock = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const token = session?.accessToken;
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/shifts/low-stock?threshold=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (data.success && data.data?.length > 0) {
          setProducts(data.data);
          setVisible(true);
        }
      } catch {
        // Silence errors — không ảnh hưởng UX
      }
    };

    // Kiểm tra ngay khi mount
    checkLowStock();

    // Kiểm tra lại mỗi 5 phút
    const interval = setInterval(checkLowStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!visible || dismissed || products.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5">
      <div className="bg-white border border-orange-200 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-orange-50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Cảnh báo tồn kho thấp ({products.length} SP)
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-orange-400 hover:text-orange-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product list (max 5) */}
        <div className="px-4 py-2 max-h-48 overflow-y-auto">
          {products.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-1.5 border-b last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 truncate">{p.name}</span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  p.stock === 0
                    ? "bg-red-100 text-red-700"
                    : p.stock <= 5
                    ? "bg-orange-100 text-orange-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.stock === 0 ? "Hết hàng" : `Còn ${p.stock}`}
              </span>
            </div>
          ))}
          {products.length > 5 && (
            <p className="text-xs text-gray-400 text-center py-1">
              ...và {products.length - 5} sản phẩm khác
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

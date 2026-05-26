"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import PaymentDialog from "@/components/payment/PaymentDialog";

export default function CartSidebar() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDiscountAmount = useCartStore((s) => s.getDiscountAmount);
  const getVatAmount = useCartStore((s) => s.getVatAmount);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const formatVND = (amount: number) =>
    amount.toLocaleString("vi-VN") + "₫";

  const total = getTotalPrice();

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm print:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-800">Giỏ hàng</h2>
          {getTotalItems() > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {getTotalItems()}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <ShoppingBag className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-sm font-medium">Giỏ hàng trống</p>
            <p className="text-xs mt-1">Chọn sản phẩm bên trái để thêm</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-blue-50/50 transition-colors"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatVND(item.price)} × {item.quantity}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Item total + remove */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold text-blue-600 whitespace-nowrap">
                  {formatVND(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {items.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tạm tính</span>
            <span>{formatVND(getSubtotal())}</span>
          </div>

          {getDiscountAmount() > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Chiết khấu</span>
              <span>-{formatVND(getDiscountAmount())}</span>
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-600">
            <span>VAT (10%)</span>
            <span>+{formatVND(getVatAmount())}</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Tổng cộng</span>
            <span className="text-blue-600">{formatVND(total)}</span>
          </div>

          {/* Button Thanh Toán — Mở PaymentDialog */}
          <button
            onClick={() => setPaymentOpen(true)}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Thanh toán ({getTotalItems()} món)
          </button>
        </div>
      )}

      {/* Payment Dialog */}
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  );
}

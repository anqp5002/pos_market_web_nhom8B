"use client";

import { create } from "zustand";

// ==========================================
// KIỂU DỮ LIỆU
// ==========================================
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
}

interface CartState {
  items: CartItem[];
  vatRate: number; // 10% = 0.10
  discountRate: number; // 0% mặc định

  // Actions
  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  setDiscountRate: (rate: number) => void;

  // Computed (tính toán tự động)
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getVatAmount: () => number;
  getTotalPrice: () => number;
}

// ==========================================
// ZUSTAND STORE
// ==========================================
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  vatRate: 0.1, // VAT 10%
  discountRate: 0, // Chiết khấu 0%

  // Thêm sản phẩm vào giỏ (nếu đã có thì tăng SL)
  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    });
  },

  // Xóa 1 sản phẩm khỏi giỏ
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  // Cập nhật số lượng (nếu SL <= 0 thì xóa luôn)
  updateQuantity: (id, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== id) };
      }
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    });
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: () => set({ items: [] }),

  // Đặt tỷ lệ chiết khấu
  setDiscountRate: (rate) => set({ discountRate: rate }),

  // ==========================================
  // COMPUTED VALUES (Tính toán tự động)
  // ==========================================

  // Tổng số lượng món
  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Tạm tính (chưa thuế, chưa chiết khấu)
  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },

  // Số tiền chiết khấu
  getDiscountAmount: () => {
    return get().getSubtotal() * get().discountRate;
  },

  // Số tiền VAT (tính trên giá sau chiết khấu)
  getVatAmount: () => {
    const afterDiscount = get().getSubtotal() - get().getDiscountAmount();
    return afterDiscount * get().vatRate;
  },

  // Tổng tiền cuối cùng
  getTotalPrice: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const vat = get().getVatAmount();
    return subtotal - discount + vat;
  },
}));

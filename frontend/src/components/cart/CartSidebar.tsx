"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { apiFetch } from "@/lib/api";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  X, 
  CreditCard, 
  Coins, 
  QrCode, 
  Loader2, 
  User,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OrderSuccess from "../pos/OrderSuccess";

interface Customer {
  id: number;
  name: string;
  phone: string;
}

interface ActiveShift {
  id: number;
  nhanVienId: number;
  status: string;
}

export default function CartSidebar() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDiscountAmount = useCartStore((s) => s.getDiscountAmount);
  const getVatAmount = useCartStore((s) => s.getVatAmount);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  // States cho Checkout và Success Dialog
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("retail");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT_CARD" | "QR_CODE">("CASH");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // States cho OrderSuccess Dialog
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  const formatVND = (amount: number) =>
    amount.toLocaleString("vi-VN") + "₫";

  const total = getTotalPrice();

  // Load danh sách khách hàng và thông tin ca làm việc khi mở Checkout
  useEffect(() => {
    if (isCheckoutOpen) {
      setErrorMessage("");
      setCashAmount("");
      // Fetch khách hàng
      apiFetch<Customer[]>("/customers")
        .then((data) => setCustomers(data))
        .catch((err) => console.error("Error loading customers:", err));

      // Fetch ca làm việc mở (hoặc tự động tạo mới nếu không có)
      apiFetch<ActiveShift>("/orders/active-shift")
        .then((data) => setActiveShift(data))
        .catch((err) => console.error("Error loading active shift:", err));
    }
  }, [isCheckoutOpen]);

  // Tự động điền số tiền khách đưa bằng tổng tiền khi mở checkout
  useEffect(() => {
    if (isCheckoutOpen && total > 0) {
      setCashAmount(String(total));
    }
  }, [isCheckoutOpen, total]);

  // Xử lý hoàn tất thanh toán
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) {
      setErrorMessage("Không thể lấy thông tin ca làm việc. Vui lòng thử lại.");
      return;
    }

    const paidAmount = Number(cashAmount);
    if (paymentMethod === "CASH" && paidAmount < total) {
      setErrorMessage(`Số tiền khách trả không đủ (Yêu cầu tối thiểu ${formatVND(total)})`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Tạo đơn hàng mới (Trạng thái PENDING)
      const orderResult = await apiFetch<any>("/orders", {
        method: "POST",
        body: JSON.stringify({
          nhanVienId: activeShift.nhanVienId,
          caLamViecId: activeShift.id,
          khachHangId: selectedCustomerId === "retail" ? null : Number(selectedCustomerId),
          items: items.map((item) => ({
            sanPhamId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      // Mặc định mã PTTT: CASH = 1, CREDIT_CARD = 2, QR_CODE = 3
      const ptttIdMap = {
        CASH: 1,
        CREDIT_CARD: 2,
        QR_CODE: 3,
      };

      // 2. Thực hiện gọi API Thanh toán
      const paymentResult = await apiFetch<any>(`/orders/${orderResult.id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          ptttId: ptttIdMap[paymentMethod],
          amount: paymentMethod === "CASH" ? paidAmount : total,
        }),
      });

      // 3. Thanh toán thành công, set thông tin và mở Dialog thành công
      setSuccessOrder(paymentResult.order);
      setChangeAmount(paymentResult.change || 0);
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Gặp lỗi trong quá trình thanh toán đơn hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset giỏ hàng và đóng dialog thành công
  const handleNewOrder = () => {
    clearCart();
    setIsSuccessOpen(false);
    setSuccessOrder(null);
    setChangeAmount(0);
  };

  const calculatedChange = Number(cashAmount) - total;

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

          {/* Dialog Thanh Toán (Checkout Modal) */}
          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogTrigger
              render={
                <button
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                />
              }
            >
              Thanh toán ({getTotalItems()} món)
            </DialogTrigger>

            <DialogContent className="max-w-md p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-gray-900 border-b pb-2">
                  Thanh Toán Hóa Đơn
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4">
                {/* 1. Chọn khách hàng */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Khách Hàng
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="retail">Khách lẻ / Khách vãng lai</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Chọn phương thức thanh toán */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phương Thức Thanh Toán
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CASH")}
                      className={`flex flex-col items-center justify-center py-3 border rounded-xl gap-1.5 transition-all ${
                        paymentMethod === "CASH"
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <Coins className="w-5 h-5" />
                      <span className="text-xs">Tiền mặt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CREDIT_CARD")}
                      className={`flex flex-col items-center justify-center py-3 border rounded-xl gap-1.5 transition-all ${
                        paymentMethod === "CREDIT_CARD"
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs">Quẹt thẻ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("QR_CODE")}
                      className={`flex flex-col items-center justify-center py-3 border rounded-xl gap-1.5 transition-all ${
                        paymentMethod === "QR_CODE"
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span className="text-xs">Chuyển khoản QR</span>
                    </button>
                  </div>
                </div>

                {/* Tổng thanh toán */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex justify-between items-center text-sm font-semibold text-gray-800">
                  <span>Tổng cần thanh toán:</span>
                  <span className="text-lg font-bold text-blue-600 font-mono">
                    {formatVND(total)}
                  </span>
                </div>

                {/* 3. Nhập số tiền khách đưa (chỉ hiển thị nếu chọn tiền mặt) */}
                {paymentMethod === "CASH" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Số tiền khách trả
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Nhập số tiền mặt khách đưa..."
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white"
                      required
                      min={total}
                    />
                    {calculatedChange >= 0 && (
                      <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50/60 p-2 rounded border border-emerald-100/50">
                        <span>Tiền thừa thối khách:</span>
                        <span className="font-bold font-mono">{formatVND(calculatedChange)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Error message */}
                {errorMessage && (
                  <div className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                    {errorMessage}
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCheckoutOpen(false)}
                    disabled={isSubmitting}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !activeShift}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Xác Nhận</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Dialog hiển thị kết quả thành công sau thanh toán */}
      <OrderSuccess
        isOpen={isSuccessOpen}
        onClose={handleNewOrder}
        order={successOrder}
        changeAmount={changeAmount}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}

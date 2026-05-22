"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { getClientToken } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Banknote, QrCode, ShoppingBag, CheckCircle2, Printer } from "lucide-react";
import CashPayment from "./CashPayment";
import QRPayment from "./QRPayment";
import InvoiceReceipt from "@/components/invoice/InvoiceReceipt";
import CustomerSelect from "./CustomerSelect";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = "cash" | "qr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function PaymentDialog({
  open,
  onOpenChange,
}: PaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Lấy JWT token từ NextAuth session (client-side)
  useEffect(() => {
    getClientToken().then(setToken);
  }, [open]);

  const items = useCartStore((s) => s.items);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getVatAmount = useCartStore((s) => s.getVatAmount);
  const getDiscountAmount = useCartStore((s) => s.getDiscountAmount);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const formatVND = (amount: number) =>
    amount.toLocaleString("vi-VN") + "₫";

  const totalPrice = getTotalPrice();

  // Headers có JWT token
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Gọi API tạo đơn hàng + thanh toán
  const handlePayment = async (amountReceived?: number) => {
    setIsProcessing(true);
    try {
      // Bước 1: Tạo đơn hàng (POST /api/orders)
      const orderRes = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          // nhanVienId và caLamViecId sẽ được BE lấy từ JWT token
          caLamViecId: 1, // Tạm hardcode — sẽ lấy từ shift module sau
          khachHangId: customerId,
          items: items.map((item) => ({
            sanPhamId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Lỗi tạo đơn hàng");
      }

      const orderId = orderData.data?.id || orderData.id;

      // Bước 2: Thanh toán đơn hàng (POST /api/orders/:id/pay)
      const payRes = await fetch(`${API_URL}/orders/${orderId}/pay`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ptttId: method === "cash" ? 1 : 3, // 1=CASH, 3=QR_CODE
          amount: amountReceived || totalPrice,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || "Lỗi thanh toán");
      }

      // Thành công!
      setOrderResult({
        orderId,
        change: (amountReceived || totalPrice) - totalPrice,
        invoiceNumber: payData.data?.invoice?.invoiceNumber || `INV-${orderId}`,
      });

      // Xóa giỏ hàng
      clearCart();
    } catch (error: any) {
      alert("❌ " + (error.message || "Lỗi không xác định"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset khi đóng dialog
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setOrderResult(null);
      setMethod("cash");
      setCustomerId(null);
      setIsProcessing(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Thanh toán đơn hàng
          </DialogTitle>
          <DialogDescription>
            {getTotalItems()} sản phẩm — Tổng:{" "}
            <span className="font-bold text-blue-600">
              {formatVND(totalPrice)}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Nếu đã thanh toán thành công */}
        {orderResult ? (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-700">
              Thanh toán thành công!
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 w-full space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mã đơn hàng</span>
                <span className="font-bold">#{orderResult.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số hóa đơn</span>
                <span className="font-bold">{orderResult.invoiceNumber}</span>
              </div>
              {orderResult.change > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Tiền thối lại</span>
                  <span className="font-bold">
                    {formatVND(orderResult.change)}
                  </span>
                </div>
              )}
            </div>
            {/* Nút In hóa đơn */}
            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              In hóa đơn
            </button>
            <button
              onClick={() => handleClose(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md"
            >
              Đóng và tiếp tục bán
            </button>

            {/* Invoice Receipt ẩn — chỉ hiện khi print */}
            <InvoiceReceipt
              data={{
                orderId: orderResult.orderId,
                invoiceNumber: orderResult.invoiceNumber,
                items: orderResult.items || [],
                subtotal: orderResult.subtotal || 0,
                discount: orderResult.discount || 0,
                vat: orderResult.vat || 0,
                total: orderResult.total || totalPrice,
                amountReceived: orderResult.amountReceived || totalPrice,
                change: orderResult.change || 0,
                paymentMethod: method === "cash" ? "Tiền mặt" : "QR Code",
              }}
            />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tóm tắt đơn hàng */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({getTotalItems()} món)</span>
                <span>{formatVND(getSubtotal())}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Chiết khấu</span>
                  <span>-{formatVND(getDiscountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>VAT (10%)</span>
                <span>+{formatVND(getVatAmount())}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900 pt-1.5 border-t border-gray-200">
                <span>Tổng thanh toán</span>
                <span className="text-blue-600">{formatVND(totalPrice)}</span>
              </div>
            </div>

            {/* Chọn khách hàng */}
            <CustomerSelect value={customerId} onChange={setCustomerId} />

            {/* Tabs chọn phương thức thanh toán */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod("cash")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    method === "cash"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  Tiền mặt
                </button>
                <button
                  onClick={() => setMethod("qr")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    method === "qr"
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  QR Code
                </button>
              </div>
            </div>

            {/* Nội dung theo phương thức */}
            {method === "cash" ? (
              <CashPayment
                totalAmount={totalPrice}
                onConfirm={(amountReceived) => handlePayment(amountReceived)}
                isProcessing={isProcessing}
              />
            ) : (
              <QRPayment
                totalAmount={totalPrice}
                onConfirm={() => handlePayment()}
                isProcessing={isProcessing}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { QrCode, CheckCircle2, Clock } from "lucide-react";

interface QRPaymentProps {
  totalAmount: number;
  onConfirm: () => void;
  isProcessing: boolean;
}

export default function QRPayment({
  totalAmount,
  onConfirm,
  isProcessing,
}: QRPaymentProps) {
  const [countdown, setCountdown] = useState(120); // 2 phút timeout
  const [status, setStatus] = useState<"waiting" | "success">("waiting");

  const formatVND = (amount: number) =>
    amount.toLocaleString("vi-VN") + "₫";

  // Đếm ngược thời gian quét QR
  useEffect(() => {
    if (status === "success" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Tổng tiền */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-500">Tổng tiền cần thanh toán</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatVND(totalAmount)}
        </p>
      </div>

      {/* Mã QR giả lập */}
      <div className="flex flex-col items-center bg-white border-2 border-dashed border-blue-200 rounded-xl p-6 space-y-3">
        {status === "waiting" ? (
          <>
            {/* QR Code VietQR */}
            <div className="w-56 h-56 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-200 relative shadow-sm p-2">
              <img 
                src={`https://img.vietqr.io/image/970422-0702947309-compact2.jpg?amount=${totalAmount}&addInfo=Thanh toan don hang POS`} 
                alt="QR Code Thanh Toán"
                className="w-full h-full object-contain"
              />
              {/* Badge VietQR */}
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md border-2 border-white tracking-wide">
                Napas247
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center">
              Quét mã QR bằng ứng dụng <span className="font-semibold text-blue-600">Ngân hàng</span> hoặc <span className="font-semibold text-pink-600">MoMo</span>
            </p>

            {/* Đếm ngược */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Hết hạn sau:{" "}
                <span className={`font-bold ${countdown < 30 ? "text-red-500" : "text-gray-700"}`}>
                  {formatTime(countdown)}
                </span>
              </span>
            </div>

            {countdown <= 0 && (
              <p className="text-sm text-red-500 font-medium">
                ⏰ Mã QR đã hết hạn! Vui lòng thử lại.
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-700">
              Thanh toán thành công!
            </p>
          </div>
        )}
      </div>

      {/* Nút xác nhận (Thu ngân bấm khi khách quét xong) */}
      {status === "waiting" && (
        <button
          onClick={() => {
            setStatus("success");
            onConfirm();
          }}
          disabled={countdown <= 0 || isProcessing}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     bg-purple-600 hover:bg-purple-700 active:scale-[0.98] shadow-md hover:shadow-lg
                     flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Khách đã quét mã — Xác nhận
            </>
          )}
        </button>
      )}
    </div>
  );
}

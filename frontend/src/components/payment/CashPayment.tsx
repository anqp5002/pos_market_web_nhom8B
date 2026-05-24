"use client";

import { useState } from "react";
import { Banknote, CheckCircle2 } from "lucide-react";

interface CashPaymentProps {
  totalAmount: number;
  onConfirm: (amountReceived: number) => void;
  isProcessing: boolean;
}

export default function CashPayment({
  totalAmount,
  onConfirm,
  isProcessing,
}: CashPaymentProps) {
  const [amountReceived, setAmountReceived] = useState<string>("");

  const receivedNum = Number(amountReceived) || 0;
  const changeAmount = receivedNum - totalAmount;
  const isEnough = receivedNum >= totalAmount;

  const formatVND = (amount: number) =>
    amount.toLocaleString("vi-VN") + "₫";

  // Gợi ý tiền chẵn thông dụng
  const suggestions = [
    50000, 100000, 200000, 500000, 1000000,
  ].filter((s) => s >= totalAmount);

  // Nếu không có gợi ý nào >= totalAmount, thêm số tròn gần nhất
  if (suggestions.length === 0) {
    const roundUp = Math.ceil(totalAmount / 10000) * 10000;
    suggestions.push(roundUp);
  }

  return (
    <div className="space-y-4">
      {/* Tổng tiền cần thanh toán */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-500">Tổng tiền cần thanh toán</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatVND(totalAmount)}
        </p>
      </div>

      {/* Input nhập tiền khách đưa */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Banknote className="w-4 h-4" />
          Tiền khách đưa
        </label>
        <input
          type="number"
          value={amountReceived}
          onChange={(e) => setAmountReceived(e.target.value)}
          placeholder="Nhập số tiền khách đưa..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-semibold
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                     bg-white transition-all placeholder:text-gray-300
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={0}
          autoFocus
        />
      </div>

      {/* Nút gợi ý tiền chẵn */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((amount) => (
          <button
            key={amount}
            onClick={() => setAmountReceived(String(amount))}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              receivedNum === amount
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            {formatVND(amount)}
          </button>
        ))}
        {/* Nút "Tiền đúng" */}
        <button
          onClick={() => setAmountReceived(String(totalAmount))}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
            receivedNum === totalAmount
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
          }`}
        >
          💰 Tiền đúng
        </button>
      </div>

      {/* Hiển thị tiền thối */}
      {receivedNum > 0 && (
        <div
          className={`rounded-lg p-3 ${
            isEnough
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p className="text-sm text-gray-600">Tiền thối lại</p>
          <p
            className={`text-xl font-bold ${
              isEnough ? "text-green-700" : "text-red-600"
            }`}
          >
            {isEnough
              ? formatVND(changeAmount)
              : `Thiếu ${formatVND(Math.abs(changeAmount))}`}
          </p>
        </div>
      )}

      {/* Nút xác nhận thanh toán */}
      <button
        onClick={() => onConfirm(receivedNum)}
        disabled={!isEnough || isProcessing}
        className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-md hover:shadow-lg
                   flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Xác nhận thanh toán tiền mặt
          </>
        )}
      </button>
    </div>
  );
}

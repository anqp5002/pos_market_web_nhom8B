"use client";

import { useState } from "react";
import { X, AlertTriangle, CheckCircle, Calculator } from "lucide-react";

interface CloseShiftProps {
  shiftId: number;
  openingBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CloseShiftDialog({
  shiftId,
  openingBalance,
  onClose,
  onSuccess,
}: CloseShiftProps) {
  const [closingBalance, setClosingBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const amount = Number(closingBalance);
    if (isNaN(amount) || amount < 0) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const token = session?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/shifts/${shiftId}/close`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ closingBalance: amount }),
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setResult(data.data.summary);
    } catch (err: any) {
      setError(err.message || "Lỗi đóng ca");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Đóng ca làm việc</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!result ? (
            /* Form nhập tiền cuối ca */
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Tiền đầu ca:</strong>{" "}
                  {openingBalance.toLocaleString("vi-VN")} ₫
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền thực tế cuối ca (₫)
                </label>
                <input
                  type="number"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  placeholder="Nhập số tiền kiểm đếm..."
                  className="w-full border rounded-lg px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  min="0"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !closingBalance}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  {loading ? "Đang xử lý..." : "Đóng ca"}
                </button>
              </div>
            </div>
          ) : (
            /* Kết quả đóng ca */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Đóng ca thành công!</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiền đầu ca:</span>
                  <span className="font-medium">
                    {result.openingBalance.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DT tiền mặt trong ca:</span>
                  <span className="font-medium text-green-600">
                    +{result.totalCashRevenue.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-500">Tiền kỳ vọng:</span>
                  <span className="font-semibold">
                    {result.expectedBalance.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiền thực tế:</span>
                  <span className="font-semibold">
                    {result.closingBalance.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-500">Chênh lệch:</span>
                  <span
                    className={`font-bold ${
                      result.difference === 0
                        ? "text-green-600"
                        : result.difference > 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.difference > 0 ? "+" : ""}
                    {result.difference.toLocaleString("vi-VN")} ₫
                    <span className="text-xs ml-1">
                      ({result.status === "BALANCED"
                        ? "Cân bằng ✅"
                        : result.status === "SURPLUS"
                        ? "Thừa"
                        : "Thiếu ⚠️"})
                    </span>
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xs text-gray-400">
                  <span>Tổng đơn hoàn thành:</span>
                  <span>{result.totalOrders} đơn</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Tổng DT (tất cả PT):</span>
                  <span>{result.totalAllRevenue.toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>

              {result.status === "DEFICIT" && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Ca này có chênh lệch{" "}
                    <strong>{Math.abs(result.difference).toLocaleString("vi-VN")} ₫</strong>{" "}
                    (thiếu). Vui lòng kiểm tra lại.
                  </span>
                </div>
              )}

              <button
                onClick={onSuccess}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đã hiểu, đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

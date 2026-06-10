"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Play,
  Square,
  DollarSign,
  ShoppingCart,
  History,
  AlertCircle,
} from "lucide-react";
import CloseShiftDialog from "@/components/shift/CloseShiftDialog";

interface Shift {
  id: number;
  nhanVienId: number;
  nhanVien: { id: number; fullName: string; username: string };
  startTime: string;
  endTime: string | null;
  openingBalance: number;
  closingBalance: number | null;
  status: string;
  _count: { donHangs: number };
}

export default function ShiftPage() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [history, setHistory] = useState<Shift[]>([]);
  const [openingBalance, setOpeningBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [error, setError] = useState("");

  // Helper: lấy token
  const getToken = async () => {
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    return session?.accessToken || null;
  };

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Fetch ca hiện tại + lịch sử
  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [currentRes, historyRes] = await Promise.all([
        fetch(`${API}/shifts/current`, { headers }),
        fetch(`${API}/shifts?limit=10`, { headers }),
      ]);

      const currentData = await currentRes.json();
      const historyData = await historyRes.json();

      setCurrentShift(currentData.data || null);
      setHistory(historyData.data || []);
    } catch {
      setError("Lỗi tải dữ liệu ca làm việc");
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mở ca
  const handleOpenShift = async () => {
    const amount = Number(openingBalance);
    if (isNaN(amount) || amount < 0) {
      setError("Vui lòng nhập số dư đầu ca hợp lệ");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const token = await getToken();
      const res = await fetch(`${API}/shifts/open`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ openingBalance: amount }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setCurrentShift(data.data);
      setOpeningBalance("");
    } catch (err: any) {
      setError(err.message || "Lỗi mở ca");
    } finally {
      setActionLoading(false);
    }
  };

  // Tính thời gian ca
  const getShiftDuration = (start: string) => {
    const diff = Date.now() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ca Làm Việc</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý mở/đóng ca, kiểm kê tiền mặt cuối ca
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Current Shift Status */}
      {currentShift ? (
        /* === CA ĐANG MỞ === */
        <div className="bg-white rounded-xl border-2 border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Ca đang mở
                </h2>
                <p className="text-sm text-gray-500">
                  {currentShift.nhanVien.fullName}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              ● ĐANG LÀM VIỆC
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Giờ bắt đầu</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(currentShift.startTime).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Thời gian làm việc</p>
              <p className="text-sm font-semibold text-blue-600">
                {getShiftDuration(currentShift.startTime)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Tiền đầu ca</p>
              <p className="text-sm font-semibold text-gray-800">
                {currentShift.openingBalance.toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShoppingCart className="w-4 h-4" />
              <span>{currentShift._count?.donHangs || 0} đơn hàng trong ca</span>
            </div>
            <button
              onClick={() => setShowCloseDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              Đóng ca
            </button>
          </div>
        </div>
      ) : (
        /* === CHƯA MỞ CA === */
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Mở ca mới</h2>
              <p className="text-sm text-gray-500">
                Nhập số tiền trong két trước khi bắt đầu bán hàng
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="Số dư đầu ca (VNĐ)..."
                className="w-full border rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <button
              onClick={handleOpenShift}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              {actionLoading ? "Đang mở..." : "Mở ca"}
            </button>
          </div>
        </div>
      )}

      {/* Shift History */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">Lịch sử ca làm việc</h3>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Chưa có lịch sử ca làm việc</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Nhân viên</th>
                  <th className="pb-2 font-medium">Bắt đầu</th>
                  <th className="pb-2 font-medium">Kết thúc</th>
                  <th className="pb-2 font-medium text-right">Tiền đầu ca</th>
                  <th className="pb-2 font-medium text-right">Tiền cuối ca</th>
                  <th className="pb-2 font-medium text-center">Đơn hàng</th>
                  <th className="pb-2 font-medium text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {history.map((shift) => (
                  <tr key={shift.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">
                      {shift.nhanVien.fullName}
                    </td>
                    <td className="py-2.5 text-gray-600">
                      {new Date(shift.startTime).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 text-gray-600">
                      {shift.endTime
                        ? new Date(shift.endTime).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {shift.openingBalance.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {shift.closingBalance != null
                        ? `${shift.closingBalance.toLocaleString("vi-VN")} ₫`
                        : "—"}
                    </td>
                    <td className="py-2.5 text-center">{shift._count.donHangs}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          shift.status === "OPEN"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {shift.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Close Shift Dialog */}
      {showCloseDialog && currentShift && (
        <CloseShiftDialog
          shiftId={currentShift.id}
          openingBalance={currentShift.openingBalance}
          onClose={() => setShowCloseDialog(false)}
          onSuccess={() => {
            setShowCloseDialog(false);
            setCurrentShift(null);
            fetchData(); // Reload dữ liệu
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getClientToken, apiFetch } from "@/lib/api";
import { RefreshCw, Clock, User, AlertTriangle, CheckCircle } from "lucide-react";

interface ShiftReport {
  id: number;
  employeeName: string;
  startTime: string;
  endTime: string | null;
  openingBalance: number;
  shiftRevenue: number;
  actualCash: number;
  deviation: number;
  status: string;
  totalOrders: number;
}

export default function TodayShiftsTable({ date }: { date?: string }) {
  const [shifts, setShifts] = useState<ShiftReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const token = await getClientToken();
      const dateParam = date ? `?date=${date}` : "";
      const res = await apiFetch<{ success: boolean; data: ShiftReport[] }>(
        `/reports/today-shifts${dateParam}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.success) {
        setShifts(res.data);
      }
    } catch (err) {
      console.error("Error fetching shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [date]);

  const formatTime = (isoStr: string | null) => {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatMoney = (amount: number) =>
    `${amount.toLocaleString("vi-VN")} ₫`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Báo Cáo Ca Hôm Nay
        </h3>
        <button
          onClick={fetchShifts}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Tải lại
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          Đang tải dữ liệu ca...
        </div>
      ) : shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
          <Clock className="w-8 h-8 mb-2 text-gray-300" />
          Chưa có ca làm việc nào hôm nay
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-2.5 font-medium">Nhân viên</th>
                <th className="px-3 py-2.5 font-medium">Mở ca</th>
                <th className="px-3 py-2.5 font-medium">Đóng ca</th>
                <th className="px-3 py-2.5 font-medium text-right">Tiền mở ca</th>
                <th className="px-3 py-2.5 font-medium text-right">Doanh thu ca</th>
                <th className="px-3 py-2.5 font-medium text-right">Thực thu</th>
                <th className="px-3 py-2.5 font-medium text-right">Độ lệch</th>
                <th className="px-3 py-2.5 font-medium text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr
                  key={s.id}
                  className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">
                        {s.employeeName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{formatTime(s.startTime)}</td>
                  <td className="px-3 py-3 text-gray-600">{formatTime(s.endTime)}</td>
                  <td className="px-3 py-3 text-right text-gray-600">
                    {formatMoney(s.openingBalance)}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-gray-800">
                    {formatMoney(s.shiftRevenue)}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-600">
                    {formatMoney(s.actualCash)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`font-medium ${
                        s.deviation === 0
                          ? "text-green-600"
                          : s.deviation > 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {s.deviation > 0 ? "+" : ""}
                      {formatMoney(s.deviation)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {s.status === "CLOSED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Đã đóng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3 h-3" />
                        Đang mở
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

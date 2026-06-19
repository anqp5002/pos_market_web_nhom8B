"use client";

import { useState, useEffect, useCallback } from "react";
import { getClientToken, apiFetch } from "@/lib/api";
import SalesChart from "@/components/reports/SalesChart";
import TopProducts from "@/components/reports/TopProducts";
import TodayShiftsTable from "@/components/reports/TodayShiftsTable";
import {
  Banknote,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Wallet,
  CreditCard,
  CheckCircle,
  XCircle,
  Package,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

// Helper format tiền VND
function fmt(n: number) {
  return n.toLocaleString("vi-VN");
}

// Helper: Chuyển Date thành YYYY-MM-DD
function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReportsDashboard() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [stats, setStats] = useState<any>(null);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isToday = selectedDate === toDateStr(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getClientToken();
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const [statsRes, chartRes, topRes] = await Promise.all([
        apiFetch<{ success: boolean; data: any }>(
          `/reports/enhanced-dashboard?date=${selectedDate}`,
          { headers }
        ),
        apiFetch<{ success: boolean; data: any[] }>(
          `/reports/sales-chart?days=7`,
          { headers }
        ),
        apiFetch<{ success: boolean; data: any[] }>(
          `/reports/top-products?limit=10&days=30`,
          { headers }
        ),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (chartRes.success) setSalesChart(chartRes.data || []);
      if (topRes.success) setTopProducts(topRes.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Label ngày hiển thị
  const dateLabel = isToday
    ? "hôm nay"
    : new Date(selectedDate).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

  // Stat cards config giống Desktop
  const cards = [
    {
      title: `Doanh thu ${isToday ? "hôm nay" : "ngày " + new Date(selectedDate).toLocaleDateString("vi-VN")}`,
      value: `${fmt(stats?.todayRevenue ?? 0)} ₫`,
      icon: Banknote,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-200",
      details: [
        { icon: Wallet, label: "Tiền mặt", value: `${fmt(stats?.cashTotal ?? 0)} ₫` },
        { icon: CreditCard, label: "Chuyển khoản", value: `${fmt(stats?.transferTotal ?? 0)} ₫` },
      ],
    },
    {
      title: `Số đơn ${isToday ? "hôm nay" : ""}`,
      value: stats?.totalOrdersToday ?? 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      borderColor: "border-blue-200",
      details: [
        { icon: CheckCircle, label: "Thành công", value: stats?.completedOrders ?? 0 },
        { icon: XCircle, label: "Thất bại/Hủy", value: stats?.cancelledOrders ?? 0 },
      ],
    },
    {
      title: "Tiền thuế (VAT)",
      value: `${fmt(stats?.vatAmount ?? 0)} ₫`,
      icon: Receipt,
      color: "text-amber-600",
      bg: "bg-amber-50",
      borderColor: "border-amber-200",
      details: [
        { icon: Receipt, label: "Mức thuế suất chung", value: `${stats?.vatRate ?? 8}%` },
      ],
    },
    {
      title: "Doanh thu tháng này",
      value: `${fmt(stats?.monthRevenue ?? 0)} ₫`,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
      borderColor: "border-violet-200",
      details: [
        { icon: Package, label: "Đang kinh doanh", value: `${stats?.totalProducts ?? 0} SP` },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Date Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thống Kê / Báo Cáo
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan hoạt động kinh doanh — {dateLabel}
          </p>
        </div>

        {/* Bộ chọn ngày */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 font-medium">Tra cứu ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={toDateStr(new Date())}
              className="border-none bg-transparent text-sm font-semibold text-gray-800 focus:ring-0 focus:outline-none cursor-pointer"
            />
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(toDateStr(new Date()))}
              className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Hôm nay
            </button>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* === TỔNG QUAN HOẠT ĐỘNG - 4 thẻ thống kê === */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Tổng Quan Hoạt Động
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                <div className="h-7 w-36 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className={`bg-white rounded-xl border ${card.borderColor} p-5 hover:shadow-lg transition-all duration-200`}
              >
                <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color} mb-3`}>
                  {card.value}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  {card.details?.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <d.icon className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {d.label}: <strong className="text-gray-700">{d.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === BIỂU ĐỒ DOANH THU 7 NGÀY === */}
      <SalesChart data={salesChart} />

      {/* === CHI TIẾT BÁO CÁO: Ca làm việc + Top SP === */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Chi Tiết Báo Cáo
        </h2>

        {/* Báo cáo ca */}
        <TodayShiftsTable date={selectedDate} />

        <div className="my-6 border-t border-gray-200" />

        {/* Top sản phẩm */}
        <TopProducts data={topProducts} />
      </div>
    </div>
  );
}

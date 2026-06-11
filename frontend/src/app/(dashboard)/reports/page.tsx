import { Metadata } from "next";
import { authFetch } from "@/lib/api";

export const metadata: Metadata = {
  title: "Báo Cáo Thống Kê - POS Market",
  description: "Thống kê doanh thu, đơn hàng và báo cáo hoạt động",
};
import SalesChart from "@/components/reports/SalesChart";
import TopProducts from "@/components/reports/TopProducts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// === ISR: Incremental Static Regeneration ===
// Yêu cầu (Hạng mục #3): Áp dụng ISR để cache báo cáo trong 60 giây.
// Lý do: Báo cáo doanh thu không cần realtime từng giây, việc cache giúp giảm tải DB 
// và tăng tốc độ load trang cho các request liên tiếp.
export const revalidate = 60;

// Server Component
async function getDashboardStats() {
  try {
    const res = await authFetch<{ success: boolean; data: any }>(
      "/reports/dashboard?period=today",
      { next: { revalidate: 60 } }
    );
    return res.data;
  } catch {
    return null;
  }
}

async function getSalesChartData() {
  try {
    const res = await authFetch<{ success: boolean; data: any[] }>(
      "/reports/sales-chart?days=7",
      { next: { revalidate: 60 } }
    );
    return res.data || [];
  } catch {
    return [];
  }
}

async function getTopProducts() {
  try {
    const res = await authFetch<{ success: boolean; data: any[] }>(
      "/reports/top-products?limit=10&days=30",
      { next: { revalidate: 60 } }
    );
    return res.data || [];
  } catch {
    return [];
  }
}

export default async function ReportsPage() {
  const [stats, salesChart, topProducts] = await Promise.all([
    getDashboardStats(),
    getSalesChartData(),
    getTopProducts(),
  ]);

  // Stats cards config
  const cards = [
    {
      title: "Doanh thu hôm nay",
      value: stats
        ? `${stats.revenue.toLocaleString("vi-VN")} ₫`
        : "0 ₫",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Đơn hàng",
      value: stats?.totalOrders ?? 0,
      subtitle: `${stats?.completedOrders ?? 0} hoàn thành · ${stats?.cancelledOrders ?? 0} hủy`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Sản phẩm",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Sắp hết hàng",
      value: stats?.lowStockProducts ?? 0,
      subtitle: "sản phẩm ≤ 10 tồn kho",
      icon: AlertTriangle,
      color: stats?.lowStockProducts > 0 ? "text-red-600" : "text-gray-500",
      bg: stats?.lowStockProducts > 0 ? "bg-red-50" : "bg-gray-50",
    },
    {
      title: "Khách hàng",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: stats?.totalOrders
        ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%`
        : "0%",
      icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard & Báo cáo
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng hợp thống kê và doanh thu hệ thống POS
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.title}</p>
            {card.subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task 5.2: Sales Chart */}
        <SalesChart data={salesChart} />

        {/* Task 5.3: Top Products */}
        <TopProducts data={topProducts} />
      </div>
    </div>
  );
}

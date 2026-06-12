"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopProduct {
  id: number;
  name: string;
  barcode: string;
  category: string;
  totalSold: number;
  totalOrders: number;
  revenue: number;
  stock: number;
}

interface TopProductsProps {
  data: TopProduct[];
}

// Bảng màu gradient cho biểu đồ
const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e",
];

export default function TopProducts({ data }: TopProductsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Sản phẩm bán chạy
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          Chưa có dữ liệu bán hàng
        </div>
      </div>
    );
  }

  // Chuẩn bị data cho chart (top 5 cho biểu đồ)
  const chartData = data.slice(0, 5).map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
    fullName: p.name,
    sold: p.totalSold,
  }));

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Top Sản phẩm bán chạy
      </h3>

      {/* Mini bar chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: "#374151" }}
              width={120}
            />
            <Tooltip
              formatter={(value: any, _name: any, props: any) => [
                `${value} đã bán`,
                props.payload.fullName,
              ]}
            />
            <Bar dataKey="sold" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng chi tiết */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Sản phẩm</th>
              <th className="pb-2 font-medium text-right">Đã bán</th>
              <th className="pb-2 font-medium text-right">Doanh thu</th>
              <th className="pb-2 font-medium text-right">Tồn kho</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-amber-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="py-2.5">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                </td>
                <td className="py-2.5 text-right font-medium text-gray-700">
                  {product.totalSold}
                </td>
                <td className="py-2.5 text-right text-gray-700">
                  {product.revenue.toLocaleString("vi-VN")} ₫
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.stock <= 10
                        ? "bg-red-100 text-red-700"
                        : product.stock <= 30
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

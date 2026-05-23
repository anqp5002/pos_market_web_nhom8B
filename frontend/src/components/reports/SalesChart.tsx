"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useState } from "react";

interface ChartData {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: ChartData[];
}

// Custom tooltip hiển thị tiền VND
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {p.name === "revenue"
              ? `Doanh thu: ${p.value.toLocaleString("vi-VN")} ₫`
              : `Số đơn: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data }: SalesChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Biểu đồ Doanh thu
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          Chưa có dữ liệu doanh thu
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Biểu đồ Doanh thu
        </h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              chartType === "bar"
                ? "bg-white text-blue-600 shadow-sm font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cột
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              chartType === "line"
                ? "bg-white text-blue-600 shadow-sm font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Đường
          </button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `${(v / 1_000).toFixed(0)}K`
                    : `${v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="revenue"
              />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `${(v / 1_000).toFixed(0)}K`
                    : `${v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                name="revenue"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Tổng doanh thu kỳ */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Tổng {data.length} ngày gần nhất
        </span>
        <span className="font-semibold text-gray-800">
          {data
            .reduce((sum, d) => sum + d.revenue, 0)
            .toLocaleString("vi-VN")}{" "}
          ₫
        </span>
      </div>
    </div>
  );
}

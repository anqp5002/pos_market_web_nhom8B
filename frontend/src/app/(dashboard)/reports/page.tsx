import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thống Kê / Báo Cáo - POS Market",
  description: "Thống kê doanh thu, đơn hàng và báo cáo hoạt động",
};

import ReportsDashboard from "@/components/reports/ReportsDashboard";

export default function ReportsPage() {
  return <ReportsDashboard />;
}

"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log lỗi ra console để debug
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] space-y-6">
      <div className="bg-red-50 p-4 rounded-full">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-gray-800">Đã xảy ra lỗi</h2>
        <p className="text-gray-500 text-sm">
          {error.message || "Không thể tải dữ liệu trang này. Vui lòng thử lại hoặc liên hệ quản trị viên."}
        </p>
      </div>
      <Button 
        onClick={() => reset()} 
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800"
      >
        <RefreshCcw className="w-4 h-4" />
        Thử lại ngay
      </Button>
    </div>
  );
}

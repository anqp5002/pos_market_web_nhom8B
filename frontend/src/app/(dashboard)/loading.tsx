export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="text-gray-500 font-medium animate-pulse">
        Đang tải dữ liệu...
      </div>
    </div>
  );
}

export default function PosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Bán Hàng (POS)</h1>
        <span className="text-sm text-gray-500">Sprint 2 — Coming soon</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Grid Area */}
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6 min-h-[500px] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-lg font-medium">Khu vực sản phẩm</p>
            <p className="text-sm">Sẽ hiển thị grid sản phẩm ở Sprint 2</p>
          </div>
        </div>
        {/* Cart Area */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[500px] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg font-medium">Giỏ hàng</p>
            <p className="text-sm">Sẽ hiển thị cart ở Sprint 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

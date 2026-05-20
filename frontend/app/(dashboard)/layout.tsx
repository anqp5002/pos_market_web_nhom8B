import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Clock, 
  Settings 
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">POS System</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link href="/reports" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/pos" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <ShoppingCart className="w-5 h-5" />
            <span>Bán Hàng</span>
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <FileText className="w-5 h-5" />
            <span>Đơn Hàng</span>
          </Link>
          <Link href="/products" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <Package className="w-5 h-5" />
            <span>Sản Phẩm</span>
          </Link>
          <Link href="/customers" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <Users className="w-5 h-5" />
            <span>Khách Hàng</span>
          </Link>
          <Link href="/shift" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <Clock className="w-5 h-5" />
            <span>Ca Làm Việc</span>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <Settings className="w-5 h-5" />
            <span>Cài Đặt</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800">Workspace</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Admin</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">A</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

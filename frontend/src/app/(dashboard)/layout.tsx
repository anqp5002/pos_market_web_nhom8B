"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/pos", icon: ShoppingCart, label: "Bán Hàng" },
  { href: "/orders", icon: FileText, label: "Đơn Hàng" },
  { href: "/products", icon: Package, label: "Sản Phẩm" },
  { href: "/customers", icon: Users, label: "Khách Hàng" },
  { href: "/shift", icon: Clock, label: "Ca Làm Việc" },
  { href: "/settings", icon: Settings, label: "Cài Đặt" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Người dùng";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">POS System</h1>
          <p className="text-xs text-gray-400 mt-0.5">Quản lý siêu thị</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
              {userInitials}
            </div>
            <span className="text-sm font-medium text-gray-700 truncate">{userName}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b flex items-center px-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "Dashboard"}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { 
  Settings,
  LogOut
} from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import StockAlert from "@/components/layout/StockAlert";
import SidebarNav from "@/components/layout/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name || "Người dùng";
  const userInitials = userName.charAt(0).toUpperCase();
  const userRole = (session as any)?.user?.role;
  const isAdmin = userRole === "Admin" || userRole === "ADMIN" || userRole === "Quản Trị Viên";

  return (
    <div className="flex h-screen bg-gray-100 print:bg-white print:h-auto">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col print:hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">POS System</h1>
        </div>
        <SidebarNav isAdmin={isAdmin} />
        <div className="p-4 border-t">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <Settings className="w-5 h-5" />
            <span>Cài Đặt</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 print:hidden">
          <h2 className="text-xl font-semibold text-gray-800">Workspace</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{userName}</span>
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                {userInitials}
              </div>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <button 
                type="submit" 
                className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </form>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible">
          {children}
        </div>
        <StockAlert />
      </main>
    </div>
  );
}

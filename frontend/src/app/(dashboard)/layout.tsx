import Link from "next/link";
import { 
  Settings,
} from "lucide-react";
import { auth } from "@/lib/auth";
import StockAlert from "@/components/layout/StockAlert";
import SidebarNav from "@/components/layout/SidebarNav";
import LogoutButton from "@/components/layout/LogoutButton";
import MobileSidebar from "@/components/layout/MobileSidebar";
import AiChatbot from "@/components/chat/AiChatbot";

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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col print:hidden">
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
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto w-full md:w-[calc(100%-16rem)]">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 print:hidden">
          <div className="flex items-center">
            <MobileSidebar isAdmin={isAdmin} />
            <h2 className="text-xl font-semibold text-gray-800 ml-2 md:ml-0">Workspace</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{userName}</span>
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                {userInitials}
              </div>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
            <LogoutButton />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 print:p-0 print:overflow-visible">
          {children}
        </div>
        <AiChatbot />
        <StockAlert />
      </main>
    </div>
  );
}



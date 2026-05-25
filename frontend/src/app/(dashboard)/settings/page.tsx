import { auth } from "@/lib/auth";
import SettingsContent from "@/components/settings/SettingsContent";
import { redirect } from "next/navigation";

// Tối ưu hóa SEO cho trang Settings
export const metadata = {
  title: "Cài Đặt Hệ Thống | POS Market",
  description: "Trang thông tin cá nhân và cấu hình bảo mật tài khoản cho nhân viên hệ thống bán hàng POS Market.",
};

export default async function SettingsPage() {
  const session = await auth();

  // Yêu cầu đăng nhập, nếu chưa đăng nhập chuyển hướng về login
  if (!session) {
    redirect("/login");
  }

  const user = session.user || {};

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6 space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Cài Đặt
        </h1>
        <p className="text-gray-500 mt-1">Quản lý hồ sơ cá nhân và thay đổi mật khẩu đăng nhập của bạn</p>
      </div>

      <SettingsContent
        user={{
          id: (user as any).id || 0,
          fullName: user.name || "Nhân viên",
          username: user.email || "guest",
          role: (user as any).role || "CASHIER",
        }}
      />
    </div>
  );
}

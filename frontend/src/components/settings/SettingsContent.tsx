"use client";

import { useState, useTransition, useActionState } from "react";
import { User, Lock, Key, Shield, Check, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { changePasswordAction, ChangePasswordState } from "@/app/actions/settings";

interface UserProfile {
  id: string | number;
  fullName: string;
  username: string;
  role: string;
}

interface SettingsContentProps {
  user: UserProfile;
}

export default function SettingsContent({ user }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Trạng thái hiển thị mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State sử dụng useActionState của React 19
  const [state, formAction, isPending] = useActionState<ChangePasswordState | null, FormData>(
    async (prevState, formData) => {
      const result = await changePasswordAction(prevState, formData);
      if (result.success) {
        // Reset form inputs nếu thành công (thực tế form.reset() được xử lý tự động khi form submit)
        // Tuy nhiên, Next.js Server Actions giữ lại dữ liệu nên chúng ta có thể làm trống form thủ công hoặc qua ref
      }
      return result;
    },
    null
  );

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Sidebar chọn Tab */}
      <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 bg-white/60 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-sm h-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === "security"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Bảo mật & Mật khẩu</span>
        </button>
      </div>

      {/* Chi tiết nội dung Tab */}
      <div className="flex-1 bg-white/75 backdrop-blur-lg border border-white/50 p-6 md:p-8 rounded-3xl shadow-xl transition-all duration-500">
        
        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Hồ Sơ Nhân Viên
              </h2>
              <p className="text-sm text-gray-500 mt-1">Thông tin định danh và vai trò của bạn trên hệ thống POS</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/50">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-blue-500/20">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg font-bold text-gray-900">{user.fullName}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 text-xs font-semibold tracking-wider rounded-full bg-blue-100 text-blue-700 uppercase border border-blue-200">
                    {user.role === "ADMIN" ? "Quản Trị Viên" : "Nhân Viên Thu Ngân"}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Mã số: #{user.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Họ và Tên</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium">
                  {user.fullName}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tên Đăng Nhập / Email</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium">
                  {user.username}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vai Trò Hệ Thống</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium capitalize">
                  {user.role.toLowerCase()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng Thái Hoạt Động</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-emerald-700 font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang hoạt động (Online)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BẢO MẬT & MẬT KHẨU */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                Thay Đổi Mật Khẩu
              </h2>
              <p className="text-sm text-gray-500 mt-1">Đảm bảo bảo mật tài khoản bằng cách thường xuyên thay đổi mật khẩu</p>
            </div>

            {/* Hiển thị Thông báo */}
            {state && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-300 ${
                  state.success
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50/50 border-rose-200 text-rose-800"
                }`}
              >
                {state.success ? (
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div className="text-sm font-medium">{state.message}</div>
              </div>
            )}

            <form action={formAction} className="space-y-5">
              {/* Mật khẩu cũ */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    className={`w-full pl-4 pr-12 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 ${
                      state?.errors?.currentPassword ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {state?.errors?.currentPassword && (
                  <p className="text-xs font-medium text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {state.errors.currentPassword}
                  </p>
                )}
              </div>

              {/* Mật khẩu mới */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    required
                    className={`w-full pl-4 pr-12 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 ${
                      state?.errors?.newPassword ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {state?.errors?.newPassword && (
                  <p className="text-xs font-medium text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {state.errors.newPassword}
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Xác nhận lại mật khẩu mới"
                    required
                    className={`w-full pl-4 pr-12 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 ${
                      state?.errors?.confirmPassword ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {state?.errors?.confirmPassword && (
                  <p className="text-xs font-medium text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {state.errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <span>Lưu Mật Khẩu Mới</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

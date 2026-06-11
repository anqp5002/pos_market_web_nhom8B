"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>Đăng xuất</span>
    </button>
  );
}


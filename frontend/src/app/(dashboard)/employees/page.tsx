import { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Quản Lý Nhân Viên - POS Market",
  description: "Quản lý tài khoản nhân viên, phân quyền và bảo mật hệ thống",
};
import { authFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import EmployeeTable from "@/components/employees/EmployeeTable";

// Server Component — SSR
async function getEmployees(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${API_URL}/employees`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getRoles(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${API_URL}/employees/roles/all`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API not ok");
    const data = await res.json();
    return data.data || [];
  } catch {
    // Fallback roles nếu API chưa có
    return [
      { id: 1, name: "Admin" },
      { id: 2, name: "Cashier" },
    ];
  }
}

export default async function EmployeesPage() {
  const session = await auth();
  const role = (session as any)?.user?.role;
  const token = (session as any)?.accessToken;

  // Chỉ Admin mới được truy cập
  const isAdmin = role === "Admin" || role === "ADMIN" || role === "Quản Trị Viên";
  if (!isAdmin) {
    redirect("/pos");
  }

  const employees = await getEmployees(token);
  const roles = await getRoles(token);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân viên</h1>
          <p className="text-sm text-gray-500 mt-1">
            Thêm, sửa, xóa tài khoản nhân viên trong hệ thống POS
          </p>
        </div>
      </div>

      <EmployeeTable employees={employees} roles={roles} />
    </div>
  );
}

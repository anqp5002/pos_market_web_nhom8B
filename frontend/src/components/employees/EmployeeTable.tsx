"use client";

import { useState } from "react";
import { getClientToken } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, UserPlus, Users } from "lucide-react";

interface Employee {
  id: number;
  username: string;
  fullName: string;
  roleId: number;
  role: { id: number; name: string };
}

interface Role {
  id: number;
  name: string;
}

interface Props {
  employees: Employee[];
  roles: Role[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function EmployeeTable({ employees: initialEmployees, roles }: Props) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    roleId: "2", // Default: Cashier
  });

  const openCreateDialog = () => {
    setEditingEmployee(null);
    setFormData({ username: "", password: "", fullName: "", roleId: "2" });
    setDialogOpen(true);
  };

  const openEditDialog = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      username: emp.username,
      password: "", // Không fill password cũ
      fullName: emp.fullName,
      roleId: String(emp.roleId),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getClientToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const body: any = {
        fullName: formData.fullName,
        roleId: Number(formData.roleId),
      };

      if (editingEmployee) {
        // Cập nhật
        if (formData.password) body.password = formData.password;
        const res = await fetch(`${API_URL}/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setEmployees((prev) =>
          prev.map((emp) => (emp.id === editingEmployee.id ? data.data : emp))
        );
      } else {
        // Tạo mới
        body.username = formData.username;
        body.password = formData.password;
        const res = await fetch(`${API_URL}/employees`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setEmployees((prev) => [...prev, data.data]);
      }

      setDialogOpen(false);
    } catch (err: any) {
      alert("❌ " + (err.message || "Lỗi không xác định"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

    try {
      const token = await getClientToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/employees/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Lỗi xóa nhân viên");

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err: any) {
      alert("❌ " + (err.message || "Lỗi không xác định"));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm">{employees.length} nhân viên</span>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="w-28 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                  Chưa có nhân viên nào
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-gray-500">{emp.id}</TableCell>
                  <TableCell className="font-medium">{emp.username}</TableCell>
                  <TableCell>{emp.fullName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={emp.role?.name === "Admin" ? "default" : "secondary"}
                    >
                      {emp.role?.name || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(emp)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingEmployee ? (
                <>
                  <Pencil className="w-5 h-5 text-blue-600" />
                  Sửa nhân viên
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Thêm nhân viên mới
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee
                ? "Cập nhật thông tin nhân viên. Để trống mật khẩu nếu không muốn đổi."
                : "Nhập thông tin để tạo tài khoản nhân viên mới."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Username — chỉ khi tạo mới */}
            {!editingEmployee && (
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  placeholder="vd: cashier01"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Mật khẩu {editingEmployee && "(để trống = giữ nguyên)"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={editingEmployee ? "••••••" : "Nhập mật khẩu"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingEmployee}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select
                value={formData.roleId}
                onValueChange={(val) =>
                  setFormData({ ...formData, roleId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang xử lý..."
                : editingEmployee
                ? "Cập nhật"
                : "Tạo nhân viên"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

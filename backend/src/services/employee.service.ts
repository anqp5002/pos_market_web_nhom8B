import prisma from '../config/db';
import bcrypt from 'bcryptjs';

export interface CreateEmployeeInput {
  username: string;
  password: string;
  fullName: string;
  roleId: number;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  roleId?: number;
  password?: string;
}

/**
 * Lấy danh sách nhân viên (include role)
 */
export async function findAll() {
  return prisma.nhanVien.findMany({
    include: { role: true },
    orderBy: { id: 'asc' },
  });
}

/**
 * Lấy nhân viên theo ID
 */
export async function findById(id: number) {
  return prisma.nhanVien.findUnique({
    where: { id },
    include: { role: true },
  });
}

/**
 * Tạo nhân viên mới (hash password bằng bcrypt)
 * FR-03: Admin cấp tài khoản
 */
export async function createEmployee(input: CreateEmployeeInput) {
  const { username, password, fullName, roleId } = input;

  // Kiểm tra username trùng
  const existing = await prisma.nhanVien.findUnique({ where: { username } });
  if (existing) {
    throw new Error('Tên đăng nhập đã tồn tại');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.nhanVien.create({
    data: {
      username,
      password: hashedPassword,
      fullName,
      roleId,
    },
    include: { role: true },
  });
}

/**
 * Cập nhật thông tin nhân viên
 */
export async function updateEmployee(id: number, input: UpdateEmployeeInput) {
  const data: any = {};

  if (input.fullName) data.fullName = input.fullName;
  if (input.roleId) data.roleId = input.roleId;
  if (input.password) {
    data.password = await bcrypt.hash(input.password, 10);
  }

  return prisma.nhanVien.update({
    where: { id },
    data,
    include: { role: true },
  });
}

/**
 * Xóa nhân viên
 */
export async function deleteEmployee(id: number) {
  return prisma.nhanVien.delete({ where: { id } });
}

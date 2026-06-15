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
  const existing = await prisma.nhanVien.findFirst({ where: { username } });
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
  const employee = await prisma.nhanVien.findUnique({
    where: { id },
    include: {
      role: true,
      _count: { select: { caLamViecs: true, donHangs: true } },
    },
  });

  if (!employee) {
    throw new Error('Nhân viên không tồn tại');
  }

  // Không cho phép xóa Admin
  if (employee.role.name === 'Admin' || employee.role.name === 'ADMIN') {
    throw new Error('Không thể xóa tài khoản Quản trị viên');
  }

  // Kiểm tra có đang mở ca không
  const openShift = await prisma.caLamViec.findFirst({
    where: { nhanVienId: id, status: 'OPEN' },
  });

  if (openShift) {
    throw new Error('Nhân viên đang mở ca làm việc, không thể xóa. Vui lòng đóng ca trước.');
  }

  // Kiểm tra khóa ngoại (đã có giao dịch)
  if (employee._count.caLamViecs > 0 || employee._count.donHangs > 0) {
    throw new Error('Nhân viên này đã có dữ liệu giao dịch (ca làm việc / đơn hàng), không thể xóa');
  }

  return prisma.nhanVien.delete({ where: { id } });
}

/**
 * Lấy danh sách vai trò
 */
export async function getRoles() {
  return prisma.vaiTro.findMany({ orderBy: { id: 'asc' } });
}

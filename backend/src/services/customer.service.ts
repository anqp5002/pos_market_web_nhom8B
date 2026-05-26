import prisma from '../config/prisma';

interface CustomerQuery {
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateCustomerData {
  name: string;
  phone?: string;
  email?: string;
}

interface UpdateCustomerData {
  name?: string;
  phone?: string;
  email?: string;
}

// Lấy danh sách khách hàng với search và pagination
export const findAll = async (query: CustomerQuery) => {
  const { search, page = 1, limit = 20 } = query;
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.khachHang.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
    }),
    prisma.khachHang.count({ where }),
  ]);

  return {
    data: customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Tìm khách hàng theo ID
export const findById = (id: number) =>
  prisma.khachHang.findUnique({ where: { id } });

// Tìm khách hàng theo SĐT (dùng trong POS)
export const findByPhone = (phone: string) =>
  prisma.khachHang.findUnique({ where: { phone } });

// Tạo khách hàng mới
export const create = (data: CreateCustomerData) =>
  prisma.khachHang.create({ data });

// Cập nhật khách hàng
export const update = (id: number, data: UpdateCustomerData) =>
  prisma.khachHang.update({
    where: { id },
    data,
  });

// Xóa khách hàng
export const remove = (id: number) =>
  prisma.khachHang.delete({ where: { id } });

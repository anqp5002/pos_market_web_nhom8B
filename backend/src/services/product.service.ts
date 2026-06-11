import prisma from '../config/prisma';

interface ProductQuery {
  search?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
}

interface CreateProductData {
  barcode: string;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
}

interface UpdateProductData {
  barcode?: string;
  name?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  imageUrl?: string;
}

// Lấy danh sách sản phẩm với search, filter, pagination
export const findAll = async (query: ProductQuery) => {
  const { search, categoryId, page = 1, limit = 20 } = query;
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [products, total] = await Promise.all([
    prisma.sanPham.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
    }),
    prisma.sanPham.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy sản phẩm theo ID
export const findById = (id: number) =>
  prisma.sanPham.findUnique({
    where: { id },
    include: { category: true },
  });

// Tìm sản phẩm theo barcode (FR-07, FR-09)
export const findByBarcode = (barcode: string) =>
  prisma.sanPham.findUnique({
    where: { barcode },
    include: { category: true },
  });

// Tạo sản phẩm mới
export const create = (data: CreateProductData) =>
  prisma.sanPham.create({
    data,
    include: { category: true },
  });

// Cập nhật sản phẩm
export const update = (id: number, data: UpdateProductData) =>
  prisma.sanPham.update({
    where: { id },
    data,
    include: { category: true },
  });

// Xóa sản phẩm
export const remove = (id: number) =>
  prisma.sanPham.delete({ where: { id } });

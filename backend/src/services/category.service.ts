import prisma from '../config/prisma';

// Lấy tất cả danh mục
export const findAll = () =>
  prisma.danhMuc.findMany({
    include: { _count: { select: { sanPhams: true } } },
    orderBy: { name: 'asc' },
  });

// Lấy danh mục theo ID
export const findById = (id: number) =>
  prisma.danhMuc.findUnique({
    where: { id },
    include: { sanPhams: true },
  });

// Tạo danh mục mới
export const create = (name: string) =>
  prisma.danhMuc.create({ data: { name } });

// Cập nhật danh mục
export const update = (id: number, name: string) =>
  prisma.danhMuc.update({ where: { id }, data: { name } });

// Xóa danh mục
export const remove = (id: number) =>
  prisma.danhMuc.delete({ where: { id } });

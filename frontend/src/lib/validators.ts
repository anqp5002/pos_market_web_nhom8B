import { z } from 'zod';

// Schema validate cho Product form (React Hook Form + Zod)
export const productSchema = z.object({
  barcode: z
    .string()
    .min(1, 'Mã barcode là bắt buộc')
    .max(50, 'Barcode tối đa 50 ký tự'),
  name: z
    .string()
    .min(1, 'Tên sản phẩm là bắt buộc')
    .max(200, 'Tên tối đa 200 ký tự'),
  price: z
    .number({ invalid_type_error: 'Giá phải là số' })
    .min(0, 'Giá phải >= 0'),
  stock: z
    .number({ invalid_type_error: 'Tồn kho phải là số' })
    .int('Tồn kho phải là số nguyên')
    .min(0, 'Tồn kho phải >= 0'),
  categoryId: z
    .number({ invalid_type_error: 'Vui lòng chọn danh mục' })
    .int()
    .min(1, 'Vui lòng chọn danh mục'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Schema validate cho Category
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Tên danh mục là bắt buộc')
    .max(100, 'Tên tối đa 100 ký tự'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

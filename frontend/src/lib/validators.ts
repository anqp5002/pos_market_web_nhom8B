import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(4, "Mật khẩu phải có ít nhất 4 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  barcode: z.string().min(1, "Vui lòng nhập mã barcode"),
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  price: z.number().min(0, "Giá sản phẩm phải lớn hơn hoặc bằng 0"),
  stock: z.number().min(0, "Số lượng tồn kho phải lớn hơn hoặc bằng 0"),
  categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Customer validation schema — dùng chung cho CustomerForm.tsx
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên khách hàng không được để trống')
    .max(100, 'Tên không quá 100 ký tự'),
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ (VD: 0901234567)')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal('')),
});

export type CustomerFormData = z.infer<typeof customerSchema>;


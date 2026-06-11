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
  barcode: z.string().min(1, "Vui lòng nhập mã vạch"),
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  price: z.coerce.number().min(0, "Giá không hợp lệ"),
  stock: z.coerce.number().min(0, "Tồn kho không hợp lệ").optional().default(0),
  categoryId: z.coerce.number().min(1, "Vui lòng chọn danh mục"),
  imageUrl: z.string().url("Đường dẫn ảnh không hợp lệ").optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductFormValues = ProductFormData; // Alias cho backward compatibility

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

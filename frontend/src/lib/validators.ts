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
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductFormValues = ProductFormData; // Alias cho backward compatibility

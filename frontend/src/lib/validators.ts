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

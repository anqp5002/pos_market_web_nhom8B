import { z } from 'zod';

/**
 * Zod schema — Tạo khách hàng mới
 * Validate phức tạp: tên bắt buộc, SĐT regex VN, email format
 */
export const createCustomerSchema = z.object({
  name: z
    .string({ message: 'Tên khách hàng là bắt buộc' })
    .min(1, 'Tên khách hàng không được để trống')
    .max(100, 'Tên không quá 100 ký tự')
    .transform((val) => val.trim()),
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ (VD: 0901234567)')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim() || undefined),
  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim() || undefined),
});

/**
 * Zod schema — Cập nhật khách hàng
 * Tất cả field đều optional, chỉ validate nếu được gửi
 */
export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên khách hàng không được để trống')
    .max(100, 'Tên không quá 100 ký tự')
    .transform((val) => val.trim())
    .optional(),
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal(''))
    .or(z.null())
    .transform((val) => (val === '' ? null : val?.trim())),
  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal(''))
    .or(z.null())
    .transform((val) => (val === '' ? null : val?.trim())),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

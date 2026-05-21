import { z } from 'zod';

export const createOrderSchema = z.object({
  nhanVienId: z
    .number({ message: 'ID nhân viên là bắt buộc' })
    .int()
    .positive('ID nhân viên phải > 0'),
  caLamViecId: z
    .number({ message: 'ID ca làm việc là bắt buộc' })
    .int()
    .positive('ID ca làm việc phải > 0'),
  khachHangId: z
    .number()
    .int()
    .positive('ID khách hàng phải > 0')
    .optional()
    .nullable(),
  items: z
    .array(
      z.object({
        sanPhamId: z
          .number({ message: 'ID sản phẩm là bắt buộc' })
          .int()
          .positive('ID sản phẩm phải > 0'),
        quantity: z
          .number({ message: 'Số lượng là bắt buộc' })
          .int()
          .positive('Số lượng sản phẩm phải > 0'),
      }),
      { message: 'Danh sách sản phẩm trong đơn hàng là bắt buộc' }
    )
    .min(1, 'Đơn hàng phải chứa ít nhất 1 sản phẩm'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

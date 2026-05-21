import { z } from 'zod';

export const createPaymentSchema = z.object({
  ptttId: z
    .number({ message: 'ID phương thức thanh toán là bắt buộc' })
    .int()
    .positive('ID phương thức thanh toán phải > 0'),
  amount: z
    .number({ message: 'Số tiền thanh toán là bắt buộc' })
    .positive('Số tiền thanh toán phải lớn hơn 0'),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

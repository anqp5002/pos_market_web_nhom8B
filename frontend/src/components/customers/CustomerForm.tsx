'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Plus } from 'lucide-react';

// Zod validation schema
const customerSchema = z.object({
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

type CustomerFormData = z.infer<typeof customerSchema>;

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
}

export default function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    setServerError('');
    try {
      const payload = {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
      };

      if (isEdit) {
        await apiFetch(`/customers/${customer.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/customers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setOpen(false);
      reset();
      onSuccess();
    } catch (err: any) {
      setServerError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      reset({
        name: customer?.name ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? '',
      });
      setServerError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="sm" id={`edit-customer-${customer.id}`} />
          ) : (
            <Button id="add-customer-btn" />
          )
        }
      >
        {isEdit ? (
          <Pencil className="w-4 h-4" />
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Thêm khách hàng
          </>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Tên khách hàng */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-name">
              Tên khách hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-name"
              placeholder="VD: Nguyễn Văn An"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-phone">Số điện thoại</Label>
            <Input
              id="customer-phone"
              placeholder="VD: 0901234567"
              type="tel"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              placeholder="VD: khachhang@email.com"
              type="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
              {serverError}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} id="submit-customer-btn">
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

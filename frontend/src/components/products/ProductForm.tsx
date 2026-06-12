'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '@/lib/validators';
import { apiFetch, getClientToken } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl?: string | null;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSuccess: () => void;
}

export default function ProductForm({ product, categories, onSuccess }: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl || '',
        }
      : {
          barcode: '',
          name: '',
          price: 0,
          stock: 0,
          categoryId: 0,
          imageUrl: '',
        },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    setError('');
    try {
      const token = await getClientToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const formData = new FormData();
      formData.append('barcode', data.barcode);
      formData.append('name', data.name);
      formData.append('price', String(data.price));
      formData.append('stock', String(data.stock));
      formData.append('categoryId', String(data.categoryId));
      
      if (imageFile) {
        formData.append('imageFile', imageFile);
      } else if (data.imageUrl) {
        formData.append('imageUrl', data.imageUrl);
      }

      if (isEdit) {
        await apiFetch(`/products/${product.id}`, {
          method: 'PUT',
          headers,
          body: formData,
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          headers,
          body: formData,
        });
      }
      setOpen(false);
      reset();
      setImageFile(null);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(''); setImageFile(null); } }}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="sm" />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? (
          <Pencil className="w-4 h-4" />
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Thêm Sản Phẩm
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Mã Barcode</Label>
            <Input
              id="barcode"
              placeholder="Nhập mã barcode"
              {...register('barcode')}
            />
            {errors.barcode && (
              <p className="text-red-500 text-sm">{errors.barcode.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên Sản Phẩm</Label>
            <Input
              id="name"
              placeholder="Nhập tên sản phẩm"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                step="1000"
                placeholder="0"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">Tồn Kho</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <Label>Danh Mục</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục">
                      {field.value ? categories.find(c => c.id === field.value)?.name : 'Chọn danh mục'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Image File Upload */}
          <div className="space-y-2">
            <Label htmlFor="imageFile">Ảnh Sản Phẩm</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            {product?.imageUrl && !imageFile && (
              <p className="text-xs text-gray-500 mt-1">Đã có ảnh (Tải lên ảnh mới để thay thế)</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : isEdit ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

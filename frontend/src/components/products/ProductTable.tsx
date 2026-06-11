'use client';

import { useState } from 'react';
import { apiFetch, getClientToken } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProductForm from '@/components/products/ProductForm';
import { Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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
  category: Category;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductTableProps {
  initialProducts: Product[];
  initialPagination: Pagination;
  categories: Category[];
}

export default function ProductTable({
  initialProducts,
  initialPagination,
  categories,
}: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Fetch products với params
  const fetchProducts = async (page = 1, searchTerm = search, catId = categoryFilter) => {
    setLoading(true);
    try {
      const token = await getClientToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const result = await apiFetch<{ data: Product[]; pagination: Pagination }>('/products', {
        cache: 'no-store',
        headers,
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          categoryId: catId !== 'all' ? Number(catId) : undefined,
        },
      });
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xác nhận xóa sản phẩm "${name}"?`)) return;
    try {
      const token = await getClientToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await apiFetch(`/products/${id}`, { method: 'DELETE', headers });
      fetchProducts(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa sản phẩm');
    }
  };

  // Search handler
  const handleSearch = () => {
    fetchProducts(1, search, categoryFilter);
  };

  // Category filter
  const handleCategoryChange = (value: string | null) => {
    const val = value || 'all';
    setCategoryFilter(val);
    fetchProducts(1, search, val);
  };

  // Format giá VNĐ
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Filter + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên hoặc barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả danh mục">
                {categoryFilter === 'all'
                  ? 'Tất cả danh mục'
                  : categories.find((c) => String(c.id) === categoryFilter)?.name || 'Tất cả danh mục'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSearch}>
            Tìm
          </Button>
        </div>

        <ProductForm categories={categories} onSuccess={() => fetchProducts(1)} />
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead className="text-center w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell className="text-gray-500">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                      {product.barcode}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category?.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.stock <= 10 ? 'destructive' : 'default'}>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <ProductForm
                        product={product}
                        categories={categories}
                        onSuccess={() => fetchProducts(pagination.page)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {products.length} / {pagination.total} sản phẩm
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchProducts(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchProducts(pagination.page + 1)}
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

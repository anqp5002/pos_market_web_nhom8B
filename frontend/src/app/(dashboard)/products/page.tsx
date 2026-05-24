import { authFetch } from '@/lib/api';
import ProductTable from '@/components/products/ProductTable';

// SSR: fetch data trên server
async function getProducts() {
  try {
    return await authFetch<{
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/products', {
      cache: 'no-store',
      params: { page: 1, limit: 10 },
    });
  } catch {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}

async function getCategories() {
  try {
    return await authFetch<any[]>('/categories', { cache: 'no-store' });
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const [productsResult, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
        <p className="text-gray-500 mt-1">Thêm, sửa, xóa và tìm kiếm sản phẩm trong hệ thống</p>
      </div>

      <ProductTable
        initialProducts={productsResult.data}
        initialPagination={productsResult.pagination}
        categories={categories}
      />
    </div>
  );
}

import { Metadata } from 'next';
import { authFetch } from '@/lib/api';
import CustomerTable from '@/components/customers/CustomerTable';

export const metadata: Metadata = {
  title: 'Quản Lý Khách Hàng — POS Market',
  description: 'Xem, thêm, sửa và tìm kiếm khách hàng trong hệ thống POS Market',
};

async function getCustomers() {
  try {
    return await authFetch<{
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/customers', {
      cache: 'no-store',
      params: { page: 1, limit: 10 },
    });
  } catch {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}

export default async function CustomersPage() {
  const customersResult = await getCustomers();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h1>
        <p className="text-gray-500 mt-1">
          Thêm, sửa, xóa và tìm kiếm khách hàng trong hệ thống
        </p>
      </div>

      <CustomerTable
        initialCustomers={customersResult.data}
        initialPagination={customersResult.pagination}
      />
    </div>
  );
}

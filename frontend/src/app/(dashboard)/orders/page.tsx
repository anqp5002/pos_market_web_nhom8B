import { Metadata } from 'next';
import { authFetch } from '@/lib/api';
import OrderTable from '@/components/orders/OrderTable';

export const metadata: Metadata = {
  title: 'Quản Lý Đơn Hàng - POS Market',
  description: 'Quản lý danh sách đơn hàng, xem chi tiết và trạng thái thanh toán',
};
interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
  }>;
}

async function getOrders(params: { page: number; limit: number; status?: string }) {
  try {
    return await authFetch<{
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/orders', {
      cache: 'no-store',
      params: {
        page: params.page,
        limit: params.limit,
        status: params.status || undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await (searchParams as any);
  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = Number(resolvedSearchParams?.limit) || 10;
  const status = resolvedSearchParams?.status || undefined;

  const ordersResult = await getOrders({ page, limit, status });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
        <p className="text-gray-500 mt-1">Xem, tìm kiếm, lọc và quản lý danh sách hóa đơn/đơn hàng bán ra</p>
      </div>

      <OrderTable
        initialOrders={ordersResult.data}
        initialPagination={ordersResult.pagination}
        initialStatus={status}
      />
    </div>
  );
}

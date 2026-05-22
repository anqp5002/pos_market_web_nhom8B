import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import OrderDetail from '@/components/orders/OrderDetail';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{
    orderId: string;
  }> | {
    orderId: string;
  };
}

async function getOrder(id: string) {
  try {
    return await apiFetch<any>(`/orders/${id}`, {
      cache: 'no-store',
    });
  } catch (error) {
    console.error(`Error fetching order #${id}:`, error);
    return null;
  }
}

export default async function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = await (params as any);
  const orderId = resolvedParams?.orderId;

  if (!orderId) {
    notFound();
  }

  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi Tiết Đơn Hàng #{order.id}</h1>
          <p className="text-gray-500 mt-1">Thông tin chi tiết về sản phẩm, giao dịch thanh toán và hóa đơn</p>
        </div>
      </div>

      <OrderDetail order={order} />
    </div>
  );
}

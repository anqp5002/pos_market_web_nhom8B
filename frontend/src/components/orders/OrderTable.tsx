'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  XCircle, 
  Loader2,
  Calendar,
  User,
  Phone,
  FileSpreadsheet
} from 'lucide-react';

interface Order {
  id: number;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  nhanVien: {
    fullName: string;
    username: string;
  };
  khachHang: {
    name: string;
    phone: string;
  } | null;
  _count: {
    chiTiets: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface OrderTableProps {
  initialOrders: Order[];
  initialPagination: Pagination;
  initialStatus?: string;
}

export default function OrderTable({
  initialOrders,
  initialPagination,
  initialStatus = 'all',
}: OrderTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Điều hướng URL khi thay đổi trang hoặc lọc status
  const updateRoute = (page: number, status: string) => {
    startTransition(() => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', String(page));
      searchParams.append('limit', String(initialPagination.limit));
      if (status !== 'all') {
        searchParams.append('status', status);
      }
      router.push(`/orders?${searchParams.toString()}`);
    });
  };

  const handleStatusChange = (value: string | null) => {
    const status = value || 'all';
    setStatusFilter(status);
    updateRoute(1, status);
  };

  const handlePageChange = (page: number) => {
    updateRoute(page, statusFilter);
  };

  // Hủy đơn hàng
  const handleCancelOrder = async (id: number) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${id} không?\nHành động này sẽ hoàn lại số lượng tồn kho của các sản phẩm.`)) {
      return;
    }

    setCancellingId(id);
    try {
      await apiFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      // Refresh page data
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  // Định dạng tiền tệ
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Định dạng ngày giờ
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Trạng thái badge
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-medium">
            Hoàn thành
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 font-medium">
            Chờ thanh toán
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 font-medium">
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Loading indicator overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">
          Tổng số đơn hàng: <span className="font-semibold text-gray-900">{initialPagination.total}</span>
        </div>
      </div>

      {/* Table listing */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">Mã Đơn</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead>Nhân Viên</TableHead>
              <TableHead>Khách Hàng</TableHead>
              <TableHead className="text-center">Số Mặt Hàng</TableHead>
              <TableHead className="text-right">Tổng Tiền</TableHead>
              <TableHead className="text-center w-[120px]">Trạng Thái</TableHead>
              <TableHead className="text-center w-[160px]">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                  Không tìm thấy đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              initialOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-semibold text-blue-600">
                    #{order.id}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{order.nhanVien?.fullName}</span>
                      <span className="text-xs text-gray-400">@{order.nhanVien?.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.khachHang ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.khachHang.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {order.khachHang.phone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Khách lẻ</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {order._count?.chiTiets || 0}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 font-mono">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </Button>
                      
                      {order.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancellingId === order.id}
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          {cancellingId === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>Hủy</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {initialPagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="font-semibold text-gray-700">{initialOrders.length}</span> trên <span className="font-semibold text-gray-700">{initialPagination.total}</span> đơn hàng
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={initialPagination.page <= 1 || isPending}
              onClick={() => handlePageChange(initialPagination.page - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </Button>
            <span className="flex items-center px-4 text-sm font-medium text-gray-600 bg-gray-50 border rounded-md">
              Trang {initialPagination.page} / {initialPagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={initialPagination.page >= initialPagination.totalPages || isPending}
              onClick={() => handlePageChange(initialPagination.page + 1)}
              className="flex items-center gap-1"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Printer, 
  XCircle, 
  Loader2, 
  DollarSign, 
  FileText,
  UserCheck
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import BillPreview from '@/components/invoice/BillPreview';


interface SanPham {
  id: number;
  name: string;
  barcode: string;
  price: number;
}

interface ChiTiet {
  id: number;
  quantity: number;
  price: number;
  sanPham: SanPham;
}

interface CaLamViec {
  id: number;
  name: string;
  status: string;
}

interface PhuongThucThanhToan {
  id: number;
  name: string;
  type: string;
}

interface GiaoDich {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  pttt: PhuongThucThanhToan;
}

interface HoaDon {
  id: number;
  invoiceCode: string;
  totalAmount: number;
  createdAt: string;
}

interface Order {
  id: number;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  nhanVien: {
    id: number;
    fullName: string;
    username: string;
  };
  khachHang: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  } | null;
  caLamViec: CaLamViec;
  chiTiets: ChiTiet[];
  giaoDichs: GiaoDich[];
  hoaDon: HoaDon | null;
}

interface OrderDetailProps {
  order: Order;
}

export default function OrderDetail({ order: initialOrder }: OrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [cancelling, setCancelling] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

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
      second: '2-digit',
    });
  };

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng này không?\nHành động này sẽ hoàn lại số lượng tồn kho của các sản phẩm.`)) {
      return;
    }

    setCancelling(true);
    try {
      const updatedOrder = await apiFetch<Order>(`/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      setOrder(updatedOrder);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  // Trạng thái badge
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-semibold px-3 py-1 text-sm">
            Hoàn thành
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 font-semibold px-3 py-1 text-sm">
            Chờ thanh toán
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold px-3 py-1 text-sm">
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Bản in hóa đơn ẩn trong chế độ xem thông thường, chỉ hiển thị khi thực hiện In */}
      <div className="hidden print:block font-sans">
        <BillPreview order={order as any} />
      </div>

      {/* Nội dung chi tiết đơn hàng thông thường (ẩn khi in) */}
      <div className="print:hidden space-y-6">
        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-slate-200 hover:bg-slate-100"
                />
              }
            >
              <Printer className="w-4 h-4" />
              <span>Xem & In Hóa Đơn</span>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-gray-900 border-b pb-2">
                  Bản Xem Trước Hóa Đơn
                </DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <BillPreview order={order as any} />
              </div>
            </DialogContent>
          </Dialog>
          
          {order.status !== 'CANCELLED' && (
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="flex items-center gap-2"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>Hủy đơn hàng</span>
            </Button>
          )}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:grid-cols-1 print:gap-4">
        {/* Left column: Product items table */}
        <div className="lg:col-span-2 space-y-6 print:col-span-1">
          <Card className="shadow-sm border">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>Danh sách mặt hàng</span>
                <span className="text-sm font-normal text-gray-500 font-mono">
                  ({order.chiTiets.length} sản phẩm)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-[50px]">#</TableHead>
                    <TableHead>Mã SP (Barcode)</TableHead>
                    <TableHead>Tên Sản Phẩm</TableHead>
                    <TableHead className="text-right">Đơn Giá</TableHead>
                    <TableHead className="text-center">Số Lượng</TableHead>
                    <TableHead className="text-right pr-6">Thành Tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.chiTiets.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/30">
                      <TableCell className="pl-6 text-gray-500">{index + 1}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">
                          {item.sanPham.barcode}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{item.sanPham.name}</TableCell>
                      <TableCell className="text-right font-mono">{formatPrice(item.price)}</TableCell>
                      <TableCell className="text-center font-semibold font-mono">{item.quantity}</TableCell>
                      <TableCell className="text-right pr-6 font-semibold font-mono text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Transactions */}
          <Card className="shadow-sm border">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-800">Lịch sử giao dịch thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {order.giaoDichs.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">Chưa có giao dịch thanh toán nào</p>
              ) : (
                <div className="space-y-4">
                  {order.giaoDichs.map((gd) => (
                    <div key={gd.id} className="flex justify-between items-center p-3 rounded-lg border bg-gray-50/40 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-800">
                            {gd.pttt.name} ({gd.pttt.type})
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Thời gian: {formatDate(gd.createdAt)}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold font-mono text-gray-900">
                          {formatPrice(gd.amount)}
                        </p>
                        <Badge variant={gd.status === 'SUCCESS' ? 'default' : 'destructive'} className="text-[10px] uppercase font-bold tracking-wide">
                          {gd.status === 'SUCCESS' ? 'Thành công' : gd.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Customer, employee and bill summary */}
        <div className="space-y-6 print:col-span-1">
          {/* Status and general summary */}
          <Card className="shadow-sm border overflow-hidden">
            <div className="p-5 border-b bg-gray-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</span>
                {renderStatusBadge(order.status)}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Ngày lập đơn:</span>
                <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cộng tiền hàng:</span>
                  <span className="font-medium text-gray-900 font-mono">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chiết khấu / Thuế:</span>
                  <span className="font-medium text-gray-900 font-mono">0 ₫</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                  <span className="text-xl font-bold text-blue-600 font-mono">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card className="shadow-sm border">
            <CardHeader className="bg-gray-50/50 pb-3 border-b">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Khách hàng</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              {order.khachHang ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Họ và tên</span>
                    <span className="font-semibold text-gray-800">{order.khachHang.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Số điện thoại</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {order.khachHang.phone}
                    </span>
                  </div>
                  {order.khachHang.email && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Email</span>
                      <span className="font-medium text-gray-800">{order.khachHang.email}</span>
                    </div>
                  )}
                  {order.khachHang.address && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Địa chỉ</span>
                      <span className="font-medium text-gray-800 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                        <span>{order.khachHang.address}</span>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-400 italic">
                  Khách vãng lai / Khách lẻ
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cashier and Shift Card */}
          <Card className="shadow-sm border">
            <CardHeader className="bg-gray-50/50 pb-3 border-b">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                <span>Nhân viên & Ca làm</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Nhân viên thu ngân</span>
                <span className="font-semibold text-gray-800">{order.nhanVien?.fullName}</span>
                <span className="text-xs text-gray-400">@{order.nhanVien?.username}</span>
              </div>
              
              {order.caLamViec && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Ca làm việc</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {order.caLamViec.name}
                  </span>
                  <span className="text-xs text-gray-500 uppercase font-semibold mt-1">
                    Trạng thái ca: {order.caLamViec.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Card */}
          {order.hoaDon && (
            <Card className="shadow-sm border">
              <CardHeader className="bg-gray-50/50 pb-3 border-b">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Hóa đơn điện tử</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Mã hóa đơn</span>
                  <span className="font-bold text-gray-800 font-mono tracking-wider">{order.hoaDon.invoiceCode}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Ngày xuất</span>
                  <span className="font-medium text-gray-800">{formatDate(order.hoaDon.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}



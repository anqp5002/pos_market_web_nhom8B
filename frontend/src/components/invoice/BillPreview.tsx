'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  Download, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';

interface SanPham {
  id: number;
  name: string;
  barcode: string;
  price: number;
  category?: {
    name: string;
  } | null;
}

interface ChiTiet {
  id: number;
  quantity: number;
  price: number;
  sanPham: SanPham;
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
  } | null;
  chiTiets: ChiTiet[];
  giaoDichs?: any[];
  hoaDon?: {
    invoiceCode?: string;
    invoiceNumber?: string;
  } | null;
}

interface BillPreviewProps {
  order: Order;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Hàm suy luận đơn vị tính (UOM)
function getUOM(productName: string, categoryName?: string): string {
  const name = productName.toLowerCase();
  const cat = categoryName?.toLowerCase() || '';
  
  if (name.includes('nước') || name.includes('coca') || name.includes('pepsi') || name.includes('sting') || name.includes('red bull') || cat.includes('uống')) {
    return 'Chai';
  }
  if (name.includes('mì') || name.includes('bánh') || name.includes('snack') || name.includes('oreo') || name.includes('chocopie') || cat.includes('kẹo')) {
    return 'Gói';
  }
  if (name.includes('gạo') || name.includes('bột giặt') || name.includes('bơ thực vật')) {
    return 'Kg';
  }
  if (name.includes('sữa tươi') || name.includes('sữa đậu nành') || name.includes('fami') || name.includes('yakult') || cat.includes('sữa')) {
    return 'Hộp';
  }
  if (name.includes('kem đánh răng') || name.includes('bàn chải') || name.includes('nước rửa chén') || name.includes('dầu gội') || name.includes('sữa tắm') || cat.includes('dụng')) {
    return 'Chai/Cái';
  }
  return 'Cái';
}

export default function BillPreview({ order }: BillPreviewProps) {
  const [emailInput, setEmailInput] = useState(order.khachHang?.email || '');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  // Định dạng VND
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

  // Kích hoạt In hóa đơn
  const handlePrint = () => {
    window.print();
  };

  // Tải xuống PDF hóa đơn
  const handleDownloadPdf = () => {
    window.open(`${API_URL}/orders/${order.id}/pdf`, '_blank');
  };

  // Gửi Email hóa đơn
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      alert('Vui lòng nhập địa chỉ email nhận');
      return;
    }

    setEmailStatus('sending');
    setEmailPreviewUrl(null);
    try {
      const res = await fetch(`${API_URL}/orders/${order.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi gửi email');
      }

      setEmailStatus('success');
      setEmailMessage('Đã gửi email hóa đơn điện tử thành công!');
      if (data.previewUrl) {
        setEmailPreviewUrl(data.previewUrl);
      }
    } catch (err: any) {
      setEmailStatus('error');
      setEmailMessage(err.message || 'Không thể gửi email hóa đơn');
    }
  };

  const invoiceCode = order.hoaDon?.invoiceNumber || `INV-${order.id.toString().padStart(6, '0')}`;
  const vatAmount = order.total * 0.1;
  const grandTotal = order.total + vatAmount;

  // Ánh xạ trạng thái đơn
  let paymentStatus = 'PENDING';
  let statusBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  if (order.status === 'COMPLETED') {
    paymentStatus = 'PAID';
    statusBadgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (order.status === 'CANCELLED') {
    paymentStatus = 'CANCELLED';
    statusBadgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  // Lấy phương thức thanh toán từ giao dịch đầu tiên
  const ptttName = order.giaoDichs?.[0]?.pttt?.name || 'CASH';

  return (
    <div className="space-y-6">
      {/* CSS dành riêng cho chế độ In ấn trình duyệt (Giải quyết triệt để lỗi không hiển thị hoặc đè đè layout) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Ẩn hoàn toàn tất cả các phần tử khác trên body khi in */
          body * {
            visibility: hidden !important;
          }
          /* Chỉ hiển thị và định dạng vùng hóa đơn này */
          #invoice-receipt, #invoice-receipt * {
            visibility: visible !important;
          }
          #invoice-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      {/* Nút điều khiển (ẩn khi in) */}
      <div className="flex flex-wrap gap-3 justify-end print:hidden bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex items-center gap-2 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>In Hóa Đơn</span>
        </Button>
        <Button
          onClick={handleDownloadPdf}
          variant="outline"
          className="flex items-center gap-2 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
        >
          <Download className="w-4 h-4 text-purple-600" />
          <span>Tải File PDF</span>
        </Button>
        
        {order.status === 'COMPLETED' && (
          <Button
            onClick={() => setShowEmailInput(!showEmailInput)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Mail className="w-4 h-4" />
            <span>Gửi Hóa Đơn Qua Email</span>
          </Button>
        )}
      </div>

      {/* Form nhập email (ẩn khi in) */}
      {showEmailInput && order.status === 'COMPLETED' && (
        <div className="print:hidden bg-blue-50/50 p-5 rounded-xl border border-blue-100/60 space-y-3">
          <form onSubmit={handleSendEmail} className="flex gap-2 max-w-lg">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Nhập địa chỉ email khách hàng..."
              className="flex-1 px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
              disabled={emailStatus === 'sending'}
            />
            <Button 
              type="submit" 
              disabled={emailStatus === 'sending'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 flex items-center gap-2"
            >
              {emailStatus === 'sending' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>Gửi Ngay</span>
            </Button>
          </form>

          {/* Email status messages */}
          {emailStatus === 'success' && (
            <div className="flex flex-col gap-1.5 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{emailMessage}</span>
              </div>
              {emailPreviewUrl && (
                <a 
                  href={emailPreviewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
                >
                  <span>Nhấp vào đây để xem hòm thư ảo Ethereal nhận hóa đơn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {emailStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-100 text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{emailMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Vùng Hóa Đơn Trực Quan - Định dạng in */}
      <div 
        id="invoice-receipt"
        className="bg-white border rounded-xl shadow-lg max-w-[650px] mx-auto p-8 font-sans text-slate-800 border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-full"
      >
        {/* Store Header */}
        <div className="text-center space-y-1.5 pb-6 border-b border-dashed border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 tracking-wider uppercase">POS MARKET - NHÓM 8B</h2>
          <p className="text-xs text-slate-500 font-medium">Địa chỉ: 97 Man Thiện, Hiệp Phú, Thủ Đức, TP. HCM</p>
          <p className="text-xs text-slate-500 font-medium">Hotline: 0123.456.789 | Email: contact@posmarket.com</p>
        </div>

        {/* Title */}
        <div className="text-center py-6 space-y-1 bg-slate-50/50 rounded-lg my-4 print:bg-transparent">
          <h3 className="text-lg font-black text-slate-900 tracking-widest uppercase">HÓA ĐƠN BÁN HÀNG</h3>
          <p className="text-xs font-mono font-bold text-blue-600 tracking-wider">Mã: {invoiceCode}</p>
        </div>

        {/* Bảng Thông Tin Chung (Invoice Header) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs pb-4 border-b border-slate-100 print:grid-cols-2">
          <div className="space-y-2">
            <div>
              <span className="text-slate-500 font-medium">Ma HD:</span>{' '}
              <span className="font-bold text-slate-900 font-mono">{invoiceCode}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Thu ngân:</span>{' '}
              <span className="font-semibold text-slate-800">{order.nhanVien?.fullName || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-2 md:text-right print:text-right">
            <div>
              <span className="text-slate-500 font-medium">Thời gian:</span>{' '}
              <span className="font-semibold text-slate-800">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Khách hàng:</span>{' '}
              <span className="font-bold text-slate-900">
                {order.khachHang?.name || 'Khách vãng lai'}
              </span>
            </div>
          </div>
        </div>

        {/* Bảng Chi Tiết Mặt Hàng (Invoice Details / Line Items) */}
        <table className="w-full text-left text-xs border-collapse my-6">
          <thead>
            <tr className="border-b border-slate-200 font-bold text-slate-600 bg-slate-50/50 print:bg-transparent">
              <th className="py-2.5 w-[35px] pl-2">STT</th>
              <th className="py-2.5">Mặt Hàng (Mã dòng & Mã vạch)</th>
              <th className="py-2.5 text-center w-[50px]">ĐVT</th>
              <th className="py-2.5 text-right w-[85px]">Đơn Giá</th>
              <th className="py-2.5 text-right w-[75px]">Chiết Khấu</th>
              <th className="py-2.5 text-center w-[45px]">SL</th>
              <th className="py-2.5 text-right w-[95px] pr-2">Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.chiTiets.map((item, index) => {
              const uom = getUOM(item.sanPham.name, item.sanPham.category?.name);
              const lineDiscount = 0;
              const lineTotal = (item.price * item.quantity) - lineDiscount;
              return (
                <tr key={item.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50/30">
                  <td className="py-3 text-slate-400 pl-2">{index + 1}</td>
                  <td className="py-3">
                    <div className="font-bold text-slate-900">{item.sanPham.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Dòng: #{item.id} | Barcode: {item.sanPham.barcode}
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-600 font-medium">{uom}</td>
                  <td className="py-3 text-right font-mono font-medium">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right font-mono text-slate-500">{formatPrice(lineDiscount)}</td>
                  {/* SL hiển thị dạng số thực (Decimal) */}
                  <td className="py-3 text-center font-bold font-mono text-slate-900">
                    {Number(item.quantity).toFixed(1)}
                  </td>
                  <td className="py-3 text-right font-bold font-mono text-blue-600 pr-2">
                    {formatPrice(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bill Total Summary */}
        <div className="w-[320px] ml-auto space-y-2.5 text-xs pt-4 border-t border-slate-100">
          <div className="flex justify-between text-slate-500">
            <span>Cộng tiền hàng gốc:</span>
            <span className="font-mono font-semibold text-slate-800">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Chiết khấu hóa đơn:</span>
            <span className="font-mono text-green-600 font-semibold">-0 ₫</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Thuế VAT (10%):</span>
            <span className="font-mono font-semibold text-slate-800">+{formatPrice(vatAmount)}</span>
          </div>
          <div className="flex justify-between items-end pt-2.5 border-t border-dashed text-sm font-bold text-slate-900">
            <span>Tổng cộng thanh toán:</span>
            <span className="text-lg text-blue-600 font-mono font-black">{formatPrice(grandTotal)}</span>
          </div>

          <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100">
            <span>Phương thức thanh toán:</span>
            <span className="font-semibold text-slate-800">
              {ptttName === 'CASH' ? 'Tiền mặt' : ptttName === 'CREDIT_CARD' ? 'Thẻ ngân hàng' : 'Chuyển khoản QR'}
            </span>
          </div>
          {ptttName === 'CASH' && (() => {
            const customerPaid = order.giaoDichs?.[0]?.amount || grandTotal;
            const changeAmt = customerPaid > grandTotal ? (customerPaid - grandTotal) : 0;
            return (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>Tiền khách đưa:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatPrice(customerPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tiền thừa trả khách:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPrice(changeAmt)}</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Receipt Footer */}
        <div className="text-center text-[10px] text-slate-400 space-y-1.5 mt-10 pt-6 border-t border-dashed border-slate-200">
          <p className="font-bold text-slate-700 text-xs italic">Cảm ơn Quý khách. Hẹn gặp lại!</p>
          <p className="font-medium">Hóa đơn điện tử có mã xác thực lập trực tiếp từ POS Market</p>
        </div>
      </div>
    </div>
  );
}

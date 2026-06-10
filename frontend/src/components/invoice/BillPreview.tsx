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
    invoiceNumber?: string;
    printedAt?: string;
  } | null;
}

interface BillPreviewProps {
  order: Order;
}

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:4000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};
const API_URL = getApiUrl();

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
          /* Ẩn tất cả mọi thứ trên trang */
          body * {
            visibility: hidden !important;
          }
          
          /* Chỉ hiển thị hóa đơn và các phần tử con của nó */
          #invoice-receipt, #invoice-receipt * {
            visibility: visible !important;
          }

          /* Đặt lại thuộc tính của hộp thoại (Dialog) để nó không cản trở việc định vị hóa đơn */
          div[role="dialog"] {
            transform: none !important;
            position: static !important;
          }

          /* Cố định hóa đơn ở góc trên cùng bên trái của trang in */
          #invoice-receipt {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Đảm bảo các nút bấm in/tải PDF không bao giờ hiển thị trên giấy */
          .print\\:hidden, .print\\:hidden * {
            display: none !important;
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

      {/* Vùng Hóa Đơn Trực Quan - Định dạng in (80mm) */}
      <div className="flex justify-center bg-gray-100/50 p-4 rounded-xl print:bg-transparent print:p-0">
        <div 
          id="invoice-receipt"
          className="bg-white border shadow-sm mx-auto p-4 font-mono text-black print:shadow-none print:border-none print:p-0 print:m-0"
          style={{ width: '80mm', maxWidth: '100%', fontSize: '12px', lineHeight: '1.4' }}
        >
          {/* Header */}
          <div className="text-center mb-3">
            <h2 className="text-base font-bold m-0 uppercase tracking-wide">SIÊU THỊ POS</h2>
            <p className="m-0 text-[11px] text-gray-700">Nhóm 8B - POS Market</p>
            <p className="m-0 text-[11px] text-gray-700">ĐT: 0123.456.789</p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Info */}
          <div className="text-[11px] mb-2 space-y-1">
            <div className="flex justify-between">
              <span>Số HĐ:</span>
              <span className="font-bold">{invoiceCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Mã đơn:</span>
              <span>#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>{order.nhanVien?.fullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span>{order.khachHang?.name || 'Khách vãng lai'}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Items */}
          <table className="w-full text-[11px] border-collapse mb-2">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left pb-1 font-semibold">Tên SP</th>
                <th className="text-center pb-1 w-[30px] font-semibold">SL</th>
                <th className="text-right pb-1 font-semibold">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.chiTiets.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-none">
                  <td className="pt-1.5 pb-1 align-top">
                    <div className="font-medium truncate max-w-[120px]">{item.sanPham.name}</div>
                  </td>
                  <td className="text-center pt-1.5 pb-1 align-top">{item.quantity}</td>
                  <td className="text-right pt-1.5 pb-1 align-top">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Totals */}
          <div className="text-[11px] space-y-1">
            <div className="flex justify-between text-gray-700">
              <span>Tạm tính:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Chiết khấu:</span>
              <span>-0 ₫</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>VAT (10%):</span>
              <span>+{formatPrice(vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-[13px] border-t border-gray-400 mt-1 pt-1">
              <span>TỔNG CỘNG:</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Payment */}
          <div className="text-[11px] mt-1 space-y-1">
            <div className="flex justify-between text-gray-700">
              <span>Thanh toán ({ptttName === 'CASH' ? 'Tiền mặt' : ptttName === 'CREDIT_CARD' ? 'Thẻ' : 'QR'}):</span>
              <span>{formatPrice(order.giaoDichs?.[0]?.amount || grandTotal)}</span>
            </div>
            {ptttName === 'CASH' && (() => {
              const customerPaid = order.giaoDichs?.[0]?.amount || grandTotal;
              const changeAmt = customerPaid > grandTotal ? (customerPaid - grandTotal) : 0;
              if (changeAmt > 0) {
                return (
                  <div className="flex justify-between font-bold">
                    <span>Tiền thối:</span>
                    <span>{formatPrice(changeAmt)}</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-600 mt-4 pt-2 border-t border-dashed border-gray-400">
            <p className="m-0 font-bold italic mb-0.5">Cảm ơn Quý khách!</p>
            <p className="m-0 text-[9px]">Hẹn gặp lại lần sau</p>
          </div>
        </div>
      </div>
    </div>
  );
}

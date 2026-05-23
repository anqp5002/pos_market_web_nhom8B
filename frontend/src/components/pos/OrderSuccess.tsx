'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Printer, 
  Download, 
  Mail, 
  Loader2, 
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import BillPreview from '@/components/invoice/BillPreview';

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  nhanVien: {
    fullName: string;
  };
  khachHang: {
    name: string;
    phone: string;
    email?: string;
  } | null;
  chiTiets: any[];
  hoaDon?: {
    invoiceNumber?: string;
  } | null;
}

interface OrderSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  changeAmount: number; // Tiền thừa trả khách
  onNewOrder: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function OrderSuccess({
  isOpen,
  onClose,
  order,
  changeAmount,
  onNewOrder,
}: OrderSuccessProps) {
  const [emailInput, setEmailInput] = useState(order?.khachHang?.email || '');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  if (!order) return null;

  const formatVND = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const handlePrint = () => {
    // Để in hóa đơn chính xác nhất, ta mở hộp thoại in của trình duyệt. 
    // BillPreview in-line trong DOM sẽ tự động hiển thị do quy tắc print:block.
    window.print();
  };

  const handleDownloadPdf = () => {
    window.open(`${API_URL}/orders/${order.id}/pdf`, '_blank');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

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
      setEmailMessage('Đã gửi hóa đơn điện tử thành công!');
      if (data.previewUrl) {
        setEmailPreviewUrl(data.previewUrl);
      }
    } catch (err: any) {
      setEmailStatus('error');
      setEmailMessage(err.message || 'Lỗi gửi email hóa đơn');
    }
  };

  const invoiceCode = order.hoaDon?.invoiceNumber || `INV-${order.id.toString().padStart(6, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      {/* Container in hóa đơn ẩn dành riêng cho máy in, sẽ hiển thị khi bấm In */}
      <div className="hidden print:block font-sans">
        <BillPreview order={order as any} />
      </div>


      <DialogContent className="max-w-md p-6 print:hidden" showCloseButton={false}>
        <DialogHeader className="flex flex-col items-center justify-center text-center space-y-2">
          {/* Animated checkmark */}
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Thanh Toán Thành Công!
          </DialogTitle>
          <p className="text-xs text-gray-500 font-mono">
            Hóa đơn: {invoiceCode}
          </p>
        </DialogHeader>

        {/* Tóm tắt thanh toán */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 my-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã đơn hàng:</span>
            <span className="font-semibold text-gray-900">#{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tổng thanh toán:</span>
            <span className="font-bold text-blue-600 font-mono">{formatVND(order.total * 1.1)}</span>
          </div>
          {changeAmount > 0 && (
            <div className="flex justify-between items-center bg-amber-50/50 p-2 rounded border border-amber-100/50">
              <span className="text-amber-800 font-medium">Tiền thừa trả khách:</span>
              <span className="font-black text-amber-600 font-mono text-base">{formatVND(changeAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Khách hàng:</span>
            <span className="font-medium text-gray-900">{order.khachHang?.name || 'Khách vãng lai'}</span>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="grid grid-cols-2 gap-2 pb-4">
          <Button 
            onClick={handlePrint}
            variant="outline" 
            className="flex items-center gap-1.5 border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>In Hóa Đơn</span>
          </Button>
          <Button 
            onClick={handleDownloadPdf}
            variant="outline" 
            className="flex items-center gap-1.5 border-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>Tải File PDF</span>
          </Button>
          {order.status === 'COMPLETED' && (
            <Button
              onClick={() => {
                setShowEmailForm(!showEmailForm);
                setEmailInput(order.khachHang?.email || '');
              }}
              variant="outline"
              className="col-span-2 flex items-center justify-center gap-1.5 border-slate-200"
            >
              <Mail className="w-4 h-4" />
              <span>Gửi Hóa Đơn Qua Email</span>
            </Button>
          )}
        </div>

        {/* Email send form */}
        {showEmailForm && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mb-4">
            <form onSubmit={handleSendEmail} className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Nhập email khách nhận..."
                className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
                disabled={emailStatus === 'sending'}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={emailStatus === 'sending'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3"
              >
                {emailStatus === 'sending' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span>Gửi</span>
                )}
              </Button>
            </form>

            {emailStatus === 'success' && (
              <div className="flex flex-col gap-1 p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{emailMessage}</span>
                </div>
                {emailPreviewUrl && (
                  <a 
                    href={emailPreviewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-1 font-semibold"
                  >
                    <span>Xem hòm thư Ethereal nhận mail</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}

            {emailStatus === 'error' && (
              <div className="flex items-center gap-1.5 p-2 bg-rose-50 text-rose-800 rounded border border-rose-100 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{emailMessage}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={onNewOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <span>Tạo Đơn Hàng Mới</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { authFetch } from '@/lib/api';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

async function getOrder(id: string) {
  try {
    return await authFetch<any>(`/orders/${id}`, { cache: 'no-store' });
  } catch {
    return null;
  }
}

export default async function PrintPage({ params }: PageProps) {
  const resolvedParams = await (params as any);
  const orderId = resolvedParams?.orderId;
  const order = await getOrder(orderId);
  if (!order) notFound();

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const fallbackDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStrForInvoice = fallbackDate.toISOString().slice(0, 10).replace(/-/g, "");
  const invoiceCode = order.hoaDon?.invoiceNumber || `HD-${dateStrForInvoice}-${String(order.id).padStart(4, '0')}`;
  const vatAmount = order.total * 0.1;
  const grandTotal = order.total + vatAmount;
  const ptttName = order.giaoDichs?.[0]?.pttt?.name || 'CASH';
  const customerPaid = order.giaoDichs?.[0]?.amount || grandTotal;
  const changeAmt = customerPaid > grandTotal ? customerPaid - grandTotal : 0;

  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hóa Đơn #{order.id}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #000;
            background: #f5f5f5;
            line-height: 1.2;
          }
          .receipt {
            width: 80mm;
            background: white;
            margin: 0 auto;
            padding: 2mm 4mm;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .total-row {
            display: flex; justify-content: space-between;
            font-weight: bold; font-size: 13px;
            border-top: 1px solid #000;
            padding-top: 3px; margin-top: 3px;
          }
          table { width: 100%; border-collapse: collapse; }
          th { border-bottom: 1px dashed #000; padding: 2px 0; font-size: 11px; }
          th:first-child { text-align: left; }
          th:nth-child(2) { text-align: center; width: 24px; }
          th:nth-child(3) { text-align: right; }
          td { padding: 2px 0; font-size: 11px; vertical-align: top; }
          td:nth-child(2) { text-align: center; }
          td:nth-child(3) { text-align: right; white-space: nowrap; }
          .actions {
            text-align: center;
            padding: 12px;
            background: #f0f0f0;
            border-bottom: 1px solid #ddd;
          }
          .btn {
            display: inline-block;
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-family: sans-serif;
            margin: 0 4px;
          }
          .btn-primary { background: #2563eb; color: white; }
          .btn-secondary { background: #6b7280; color: white; }
          @page {
            size: 80mm auto;
            margin: 0;
          }
          @media print {
            body { background: white; }
            .actions { display: none !important; }
            .receipt { margin: 0; padding: 4mm; }
          }
        `}</style>
      </head>
      <body>
        {/* Thanh nút bấm — chỉ hiện trên màn hình, ẩn khi in */}
        <div className="actions">
          <button id="btn-print" className="btn btn-primary">
            🖨️ In Hóa Đơn
          </button>
          <button id="btn-close" className="btn btn-secondary">
            ✕ Đóng
          </button>
        </div>

        {/* Nội dung hóa đơn */}
        <div className="receipt">
          {/* Header */}
          <div className="center" style={{ marginBottom: '6px' }}>
            <div className="bold" style={{ fontSize: '15px', letterSpacing: '1px' }}>SIÊU THỊ POS</div>
            <div style={{ fontSize: '11px' }}>Nhóm 8B - POS Market</div>
            <div style={{ fontSize: '11px' }}>ĐT: 0123.456.789</div>
          </div>

          <div className="divider" />

          <div className="center bold" style={{ fontSize: '13px', letterSpacing: '2px', margin: '4px 0' }}>
            HÓA ĐƠN BÁN HÀNG
          </div>

          <div className="divider" />

          {/* Thông tin chung */}
          <div style={{ fontSize: '11px' }}>
            <div className="row"><span>Số HĐ:</span><span className="bold">{invoiceCode}</span></div>
            <div className="row"><span>Mã đơn:</span><span>#{order.id}</span></div>
            <div className="row"><span>Ngày:</span><span>{formatDate(order.createdAt)}</span></div>
            <div className="row"><span>Thu ngân:</span><span>{order.nhanVien?.fullName || 'N/A'}</span></div>
            <div className="row"><span>Khách hàng:</span><span>{order.khachHang?.name || 'Khách vãng lai'}</span></div>
          </div>

          <div className="divider" />

          {/* Danh sách sản phẩm */}
          <table>
            <thead>
              <tr>
                <th>Tên SP</th>
                <th>SL</th>
                <th>T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.chiTiets?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td>{item.sanPham?.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divider" />

          {/* Tổng tiền */}
          <div style={{ fontSize: '11px' }}>
            <div className="row"><span>Tạm tính:</span><span>{formatPrice(order.total)}</span></div>
            <div className="row"><span>Chiết khấu:</span><span>0 đ</span></div>
            <div className="row"><span>VAT (10%):</span><span>+{formatPrice(vatAmount)}</span></div>
            <div className="total-row"><span>TỔNG CỘNG:</span><span>{formatPrice(grandTotal)}</span></div>
          </div>

          <div className="divider" />

          {/* Thanh toán */}
          <div style={{ fontSize: '11px' }}>
            <div className="row">
              <span>Thanh toán ({ptttName === 'CASH' ? 'Tiền mặt' : ptttName === 'CREDIT_CARD' ? 'Thẻ' : 'QR'}):</span>
              <span>{formatPrice(customerPaid)}</span>
            </div>
            {changeAmt > 0 && (
              <div className="row bold"><span>Tiền thối:</span><span>{formatPrice(changeAmt)}</span></div>
            )}
          </div>

          {/* Footer */}
          <div className="divider" />
          <div className="center" style={{ fontSize: '11px' }}>
            <div className="bold" style={{ fontStyle: 'italic' }}>Cảm ơn Quý khách!</div>
            <div style={{ fontSize: '10px' }}>Hẹn gặp lại lần sau</div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('btn-print').addEventListener('click', function() { window.print(); });
          document.getElementById('btn-close').addEventListener('click', function() { window.close(); });
          
          if (new URLSearchParams(window.location.search).get('autoprint') === '1') {
            window.addEventListener('load', function() {
              setTimeout(function() { window.print(); }, 800);
            });
          }
        `}} />
      </body>
    </html>
  );
}

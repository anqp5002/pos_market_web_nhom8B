import { authFetch } from '@/lib/api';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ orderId: string }> | { orderId: string };
}

async function getOrder(id: string) {
  try {
    return await authFetch<any>(`/orders/${id}`, { cache: 'no-store' });
  } catch {
    return null;
  }
}

// Hàm suy luận đơn vị tính
function getUOM(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes('nước') || name.includes('coca') || name.includes('pepsi') || name.includes('sting')) return 'Chai';
  if (name.includes('mì') || name.includes('bánh') || name.includes('snack')) return 'Gói';
  if (name.includes('gạo') || name.includes('bột')) return 'Kg';
  if (name.includes('sữa') || name.includes('fami') || name.includes('yakult')) return 'Hộp';
  return 'Cái';
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

  const invoiceCode = order.hoaDon?.invoiceNumber || `INV-${String(order.id).padStart(6, '0')}`;
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
            width: 80mm;
            margin: 0 auto;
            padding: 4mm;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 3px; }
          th:nth-child(2) { text-align: center; }
          th:nth-child(3) { text-align: right; }
          td { padding: 3px 0; vertical-align: top; }
          td:nth-child(2) { text-align: center; }
          td:nth-child(3) { text-align: right; }
          .no-print { display: none; }
          @media screen {
            body { border: 1px dashed #ccc; margin: 20px auto; }
            .no-print { 
              display: block;
              text-align: center;
              margin: 10px 0;
              font-family: sans-serif;
            }
            .no-print button {
              padding: 8px 20px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              margin: 0 5px;
            }
          }
          @media print {
            body { width: 80mm; margin: 0; padding: 4mm; }
            .no-print { display: none !important; }
          }
        `}</style>
      </head>
      <body>
        {/* Nút in - chỉ hiện trên màn hình */}
        <div className="no-print" style={{ fontFamily: 'sans-serif', textAlign: 'center', marginBottom: '12px' }}>
          <button onClick={() => window.print()} style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '8px' }}>
            🖨️ In Hóa Đơn
          </button>
          <button onClick={() => window.close()} style={{ padding: '8px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            ✕ Đóng
          </button>
        </div>

        {/* Header */}
        <div className="center" style={{ marginBottom: '8px' }}>
          <div className="bold" style={{ fontSize: '16px', letterSpacing: '1px' }}>SIÊU THỊ POS</div>
          <div style={{ fontSize: '11px' }}>Nhóm 8B - POS Market</div>
          <div style={{ fontSize: '11px' }}>ĐT: 0123.456.789</div>
        </div>

        <div className="divider" />

        {/* Invoice Title */}
        <div className="center" style={{ margin: '4px 0', fontWeight: 'bold', fontSize: '13px', letterSpacing: '2px' }}>
          HÓA ĐƠN BÁN HÀNG
        </div>

        <div className="divider" />

        {/* Info */}
        <div style={{ fontSize: '11px', marginBottom: '4px' }}>
          <div className="row"><span>Số HĐ:</span><span className="bold">{invoiceCode}</span></div>
          <div className="row"><span>Mã đơn:</span><span>#{order.id}</span></div>
          <div className="row"><span>Ngày:</span><span>{formatDate(order.createdAt)}</span></div>
          <div className="row"><span>Thu ngân:</span><span>{order.nhanVien?.fullName || 'N/A'}</span></div>
          <div className="row"><span>Khách hàng:</span><span>{order.khachHang?.name || 'Khách vãng lai'}</span></div>
        </div>

        <div className="divider" />

        {/* Items Table */}
        <table>
          <thead>
            <tr>
              <th>Tên SP</th>
              <th style={{ textAlign: 'center', width: '25px' }}>SL</th>
              <th style={{ textAlign: 'right' }}>T.Tiền</th>
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

        {/* Totals */}
        <div style={{ fontSize: '11px' }}>
          <div className="row"><span>Tạm tính:</span><span>{formatPrice(order.total)}</span></div>
          <div className="row"><span>Chiết khấu:</span><span>-0 đ</span></div>
          <div className="row"><span>VAT (10%):</span><span>+{formatPrice(vatAmount)}</span></div>
          <div className="total-row"><span>TỔNG CỘNG:</span><span>{formatPrice(grandTotal)}</span></div>
        </div>

        <div className="divider" />

        {/* Payment */}
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
        <div className="center" style={{ fontSize: '11px', marginTop: '4px' }}>
          <div className="bold" style={{ fontStyle: 'italic' }}>Cảm ơn Quý khách!</div>
          <div style={{ fontSize: '10px' }}>Hẹn gặp lại lần sau</div>
        </div>

        {/* Auto print script */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Tự động in khi trang tải xong (nếu có param ?autoprint=1)
          if (new URLSearchParams(window.location.search).get('autoprint') === '1') {
            window.addEventListener('load', function() {
              setTimeout(function() { window.print(); }, 500);
            });
          }
        `}} />
      </body>
    </html>
  );
}

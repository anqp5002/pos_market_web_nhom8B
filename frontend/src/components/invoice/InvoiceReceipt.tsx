"use client";

interface InvoiceData {
  orderId: number;
  invoiceNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  amountReceived: number;
  change: number;
  paymentMethod: string;
  cashierName?: string;
  customerName?: string;
}

interface InvoiceReceiptProps {
  data: InvoiceData;
}

/**
 * Component hóa đơn — ẩn trên màn hình, chỉ hiện khi in
 * FR-21: In hóa đơn
 * Sử dụng @media print CSS
 */
export default function InvoiceReceipt({ data }: InvoiceReceiptProps) {
  const formatVND = (amount: number) => amount.toLocaleString("vi-VN") + "₫";
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* CSS in ấn */}
      <style jsx global>{`
        @media print {
          /* Ẩn toàn bộ UI POS */
          body > * {
            visibility: hidden !important;
          }
          /* Chỉ hiện phần hóa đơn */
          #invoice-receipt,
          #invoice-receipt * {
            visibility: visible !important;
          }
          #invoice-receipt {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 80mm !important;
            padding: 4mm !important;
            background: white !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* Nội dung hóa đơn — ẩn trên màn hình, hiện khi print */}
      <div
        id="invoice-receipt"
        className="hidden print:block"
        style={{ fontFamily: "monospace", fontSize: "12px", width: "80mm" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
            SIÊU THỊ POS
          </h2>
          <p style={{ margin: "2px 0", fontSize: "11px" }}>Nhóm 6 — INT1334</p>
          <p style={{ margin: "2px 0", fontSize: "11px" }}>ĐT: 0123.456.789</p>
        </div>

        {/* Đường kẻ */}
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

        {/* Thông tin hóa đơn */}
        <div style={{ fontSize: "11px", marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Số HĐ:</span>
            <span style={{ fontWeight: "bold" }}>{data.invoiceNumber}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Mã đơn:</span>
            <span>#{data.orderId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Ngày:</span>
            <span>{dateStr}</span>
          </div>
          {data.cashierName && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Thu ngân:</span>
              <span>{data.cashierName}</span>
            </div>
          )}
          {data.customerName && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Khách hàng:</span>
              <span>{data.customerName}</span>
            </div>
          )}
        </div>

        {/* Đường kẻ */}
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

        {/* Danh sách sản phẩm */}
        <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "left", paddingBottom: "4px" }}>Tên SP</th>
              <th style={{ textAlign: "center", paddingBottom: "4px", width: "30px" }}>SL</th>
              <th style={{ textAlign: "right", paddingBottom: "4px" }}>T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ paddingTop: "3px" }}>{item.name}</td>
                <td style={{ textAlign: "center", paddingTop: "3px" }}>{item.quantity}</td>
                <td style={{ textAlign: "right", paddingTop: "3px" }}>
                  {formatVND(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Đường kẻ */}
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

        {/* Tổng tiền */}
        <div style={{ fontSize: "11px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tạm tính:</span>
            <span>{formatVND(data.subtotal)}</span>
          </div>
          {data.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Chiết khấu:</span>
              <span>-{formatVND(data.discount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>VAT (10%):</span>
            <span>+{formatVND(data.vat)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "14px",
              borderTop: "1px solid #000",
              paddingTop: "4px",
              marginTop: "4px",
            }}
          >
            <span>TỔNG CỘNG:</span>
            <span>{formatVND(data.total)}</span>
          </div>
        </div>

        {/* Thanh toán */}
        <div style={{ fontSize: "11px", marginTop: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Thanh toán ({data.paymentMethod}):</span>
            <span>{formatVND(data.amountReceived)}</span>
          </div>
          {data.change > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Tiền thối:</span>
              <span>{formatVND(data.change)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px dashed #000", margin: "8px 0 4px" }} />
        <div style={{ textAlign: "center", fontSize: "11px" }}>
          <p style={{ margin: "2px 0" }}>Cảm ơn quý khách!</p>
          <p style={{ margin: "2px 0", fontSize: "10px" }}>Hẹn gặp lại lần sau</p>
        </div>
      </div>
    </>
  );
}

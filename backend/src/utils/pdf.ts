import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const FONTS_DIR = path.join(__dirname, 'fonts');
const REGULAR_FONT_PATH = path.join(FONTS_DIR, 'Roboto-Regular.ttf');
const BOLD_FONT_PATH = path.join(FONTS_DIR, 'Roboto-Bold.ttf');

// Kiểm tra file font tồn tại và có dữ liệu không (tránh file 0 byte)
const isFontValid = (filePath: string): boolean => {
  if (!fs.existsSync(filePath)) return false;
  try {
    const stats = fs.statSync(filePath);
    return stats.size > 0;
  } catch {
    return false;
  }
};

// Tải font từ CDN về máy local sử dụng file tạm thời (.tmp) để tránh bị lỗi tệp tải dở hoặc 0 byte
async function downloadFont(url: string, dest: string): Promise<void> {
  const tempDest = `${dest}.tmp`;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(tempDest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close(() => {
          fs.unlink(tempDest, () => {});
        });
        reject(new Error(`Failed to download font: Status Code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          fs.rename(tempDest, dest, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });
    }).on('error', (err) => {
      file.close(() => {
        fs.unlink(tempDest, () => {});
      });
      reject(err);
    });
  });
}

// Đảm bảo font chữ đã được tải xuống để tránh lỗi kí tự tiếng Việt
export async function ensureFonts(): Promise<void> {
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }

  // Xóa các file font 0 byte / bị hỏng nếu có
  if (fs.existsSync(REGULAR_FONT_PATH) && !isFontValid(REGULAR_FONT_PATH)) {
    try { fs.unlinkSync(REGULAR_FONT_PATH); } catch {}
  }
  if (fs.existsSync(BOLD_FONT_PATH) && !isFontValid(BOLD_FONT_PATH)) {
    try { fs.unlinkSync(BOLD_FONT_PATH); } catch {}
  }

  try {
    if (!isFontValid(REGULAR_FONT_PATH)) {
      console.log('📥 Đang tải Roboto-Regular.ttf từ Google Fonts...');
      await downloadFont(
        'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf',
        REGULAR_FONT_PATH
      );
      console.log('✅ Đã tải Roboto-Regular.ttf');
    }

    if (!isFontValid(BOLD_FONT_PATH)) {
      console.log('📥 Đang tải Roboto-Bold.ttf từ Google Fonts...');
      await downloadFont(
        'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf',
        BOLD_FONT_PATH
      );
      console.log('✅ Đã tải Roboto-Bold.ttf');
    }
  } catch (error) {
    console.error('❌ Lỗi tải font chữ tiếng Việt cho PDF:', error);
    throw error;
  }
}

// Định dạng VND
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Định dạng ngày giờ
const formatDate = (date: Date) => {
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

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
    return 'Cái';
  }
  return 'Cái';
}

function getPaymentMethodLabel(name: string): string {
  switch (name) {
    case 'CASH': return 'Tiền mặt';
    case 'CREDIT_CARD': return 'Thẻ ngân hàng';
    case 'QR_CODE': return 'Chuyển khoản QR';
    default: return 'Tiền mặt';
  }
}

export async function generateInvoicePdf(order: any): Promise<Buffer> {
  await ensureFonts();

  // Khởi tạo tài liệu jsPDF khổ giấy A4 dọc
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load font vào bộ nhớ ảo
  if (fs.existsSync(REGULAR_FONT_PATH)) {
    const regularBase64 = fs.readFileSync(REGULAR_FONT_PATH, { encoding: 'base64' });
    doc.addFileToVFS('Roboto-Regular.ttf', regularBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  }

  if (fs.existsSync(BOLD_FONT_PATH)) {
    const boldBase64 = fs.readFileSync(BOLD_FONT_PATH, { encoding: 'base64' });
    doc.addFileToVFS('Roboto-Bold.ttf', boldBase64);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  }

  // Sử dụng font Roboto vừa nạp
  doc.setFont('Roboto', 'normal');

  let y = 20; // Tọa độ Y bắt đầu vẽ

  // 1. Tiêu đề cửa hàng
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(22);
  doc.text('POS MARKET - NHÓM 8B', 105, y, { align: 'center' });
  
  y += 8;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(10);
  doc.text('Địa chỉ: 97 Man Thiện, Hiệp Phú, Thủ Đức, TP. HCM', 105, y, { align: 'center' });
  
  y += 5;
  doc.text('Điện thoại: 0123.456.789 - Email: contact@posmarket.com', 105, y, { align: 'center' });

  y += 7;
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y); // Đường kẻ ngang phân tách

  // 2. Tiêu đề Hóa Đơn
  y += 12;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(16);
  doc.text('HÓA ĐƠN BÁN HÀNG', 105, y, { align: 'center' });

  // 3. Thông tin chung về đơn hàng (Bảng Thông Tin Chung - Invoice Header)
  y += 10;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(9.5);
  
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const invoiceCode = order.hoaDon?.invoiceNumber || `INV-${order.id.toString().padStart(6, '0')}`;
  
  // Trạng thái thanh toán ánh xạ từ order.status sang PENDING, PAID, CANCELLED
  let paymentStatus = 'PENDING';
  if (order.status === 'COMPLETED') paymentStatus = 'PAID';
  else if (order.status === 'CANCELLED') paymentStatus = 'CANCELLED';

  // Lấy phương thức thanh toán từ giao dịch đầu tiên
  const ptttName = order.giaoDichs?.[0]?.pttt?.name || 'CASH';

  // Vẽ thông tin dạng 2 cột chi tiết
  // Cột trái
  doc.text(`Ma HD: ${invoiceCode}`, 15, y);
  y += 6;
  doc.text(`Thu ngân: ${order.nhanVien?.fullName || 'N/A'}`, 15, y);

  // Cột phải (tọa độ x = 110)
  let yRight = y - 6;
  doc.text(`Thời gian: ${formatDate(orderDate)}`, 110, yRight);
  yRight += 6;
  const customerName = order.khachHang?.name || 'Khách vãng lai';
  doc.text(`Khách hàng: ${customerName}`, 110, yRight);

  // 4. Bảng danh sách sản phẩm (Bảng Chi Tiết Mặt Hàng - Invoice Details)
  y += 10;
  doc.setLineWidth(0.3);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8.5);
  doc.text('STT', 17, y);
  doc.text('Mặt hàng (Mã dòng & Mã vạch)', 28, y);
  doc.text('ĐVT', 105, y, { align: 'center' });
  doc.text('Đơn giá', 128, y, { align: 'right' });
  doc.text('Chiết khấu', 152, y, { align: 'right' });
  doc.text('SL', 168, y, { align: 'center' });
  doc.text('Thành tiền', 193, y, { align: 'right' });

  y += 3;
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8.5);
  let stt = 1;

  for (const item of order.chiTiets || []) {
    // Tránh nhảy trang nếu vượt quá giới hạn chiều cao A4
    if (y > 270) {
      doc.addPage();
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8.5);
      y = 20;
    }

    const uom = getUOM(item.sanPham?.name || '', item.sanPham?.category?.name);
    const lineDiscount = 0; // default 0
    const lineTotal = (item.price * item.quantity) - lineDiscount;

    doc.text(String(stt++), 17, y);
    
    // Tên SP và Mã vạch/Mã dòng
    const productLabel = `${item.sanPham?.name || 'Sản phẩm'} (Dòng: #${item.id}, Barcode: ${item.sanPham?.barcode || 'N/A'})`;
    // Cắt bớt nếu tên quá dài
    const truncatedLabel = productLabel.length > 38 ? productLabel.substring(0, 36) + '...' : productLabel;
    doc.text(truncatedLabel, 28, y);
    
    doc.text(uom, 105, y, { align: 'center' });
    doc.text(formatVND(item.price), 128, y, { align: 'right' });
    doc.text(formatVND(lineDiscount), 152, y, { align: 'right' });
    
    // SL hiển thị dạng số thực (Decimal) để hỗ trợ hàng cân ký
    doc.text(Number(item.quantity).toFixed(1), 168, y, { align: 'center' });
    
    doc.text(formatVND(lineTotal), 193, y, { align: 'right' });

    y += 6;
  }

  doc.line(15, y, 195, y);

  // 5. Tổng cộng hóa đơn
  y += 8;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(9.5);
  doc.text('Cộng tiền hàng:', 120, y);
  doc.text(formatVND(order.total), 193, y, { align: 'right' });

  y += 6;
  doc.setFont('Roboto', 'normal');
  doc.text('Chiết khấu (0%):', 120, y);
  doc.text(formatVND(0), 193, y, { align: 'right' });

  y += 6;
  const vatAmount = order.total * 0.1; // VAT 10%
  doc.text('Thuế VAT (10%):', 120, y);
  doc.text(formatVND(vatAmount), 193, y, { align: 'right' });

  y += 8;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(12);
  doc.text('TỔNG THANH TOÁN:', 120, y);
  doc.text(formatVND(order.total + vatAmount), 193, y, { align: 'right' });

  y += 8;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(9.5);
  doc.text('Phương thức thanh toán:', 120, y);
  doc.text(getPaymentMethodLabel(ptttName), 193, y, { align: 'right' });

  const grandTotal = order.total + vatAmount;
  const customerPaid = order.giaoDichs?.[0]?.amount || grandTotal;
  const changeAmt = customerPaid > grandTotal ? (customerPaid - grandTotal) : 0;

  if (ptttName === 'CASH') {
    y += 6;
    doc.text('Tiền khách đưa:', 120, y);
    doc.text(formatVND(customerPaid), 193, y, { align: 'right' });

    y += 6;
    doc.setFont('Roboto', 'bold');
    doc.text('Tiền thừa trả khách:', 120, y);
    doc.text(formatVND(changeAmt), 193, y, { align: 'right' });
  }

  // 6. Lời cảm ơn
  y += 20;
  if (y > 275) {
    doc.addPage();
    y = 30;
  }
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10.5);
  doc.text('Cảm ơn Quý khách. Hẹn gặp lại!', 105, y, { align: 'center' });
  
  y += 5;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8.5);
  doc.text('Hóa đơn điện tử có mã xác thực lập trực tiếp từ POS Market', 105, y, { align: 'center' });

  // Trả về file dưới dạng Node.js Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

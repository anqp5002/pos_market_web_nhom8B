import nodemailer from 'nodemailer';

// Định dạng VND
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export async function sendInvoiceEmail(
  toEmail: string,
  order: any,
  pdfBuffer: Buffer
): Promise<{ success: boolean; previewUrl?: string | false }> {
  console.log(`✉️ Bắt đầu quá trình gửi hóa đơn tới email: ${toEmail}...`);

  let transporter: nodemailer.Transporter;
  let useTestAccount = false;
  let fromEmail = process.env.EMAIL_FROM || '"POS Market" <noreply@posmarket.com>';

  // 1. Cấu hình transporter (dùng môi trường thực hoặc Ethereal test account)
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    console.log('📝 Sử dụng cấu hình SMTP từ biến môi trường (.env)');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true cho cổng 465, false cho cổng khác
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log('⚠️ Không tìm thấy cấu hình SMTP thực tế trong .env. Đang tạo tài khoản test Ethereal...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true cho cổng 465, false cho cổng khác
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    fromEmail = `"POS Market Test" <${testAccount.user}>`;
    useTestAccount = true;
  }

  // 2. Nội dung Email HTML
  const invoiceNumber = order.hoaDon?.invoiceNumber || `INV-${order.id.toString().padStart(6, '0')}`;
  const totalWithVat = order.total * 1.1; // Tổng cộng cả VAT

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
      <h2 style="color: #2563eb; text-align: center;">CẢM ƠN QUÝ KHÁCH ĐÃ MUA SẮM!</h2>
      <p>Kính chào quý khách,</p>
      <p>Cửa hàng <strong>POS Market - Nhóm 8B</strong> xin gửi lời cảm ơn chân thành vì sự ủng hộ của quý khách. Dưới đây là thông tin tóm tắt về hóa đơn điện tử của quý khách:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Mã hóa đơn:</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-family: monospace;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Ngày giao dịch:</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date(order.createdAt).toLocaleString('vi-VN')}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Thu ngân:</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${order.nhanVien?.fullName || 'Thu ngân'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Tổng thanh toán (gồm VAT 10%):</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #2563eb; font-weight: bold; font-size: 16px;">${formatVND(totalWithVat)}</td>
        </tr>
      </table>

      <p>Chi tiết đầy đủ hóa đơn đã được xuất và đính kèm trong tệp PDF gửi kèm email này (<code>invoice.pdf</code>).</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p><strong>POS Market - Hệ thống quản lý bán hàng siêu thị tiện lợi</strong></p>
        <p>Địa chỉ: 97 Man Thiện, Hiệp Phú, Thủ Đức, TP. HCM | Hotline: 0123.456.789</p>
      </div>
    </div>
  `;

  // 3. Gửi Email
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: `[POS Market] Hóa đơn điện tử mua hàng ${invoiceNumber}`,
    html: htmlContent,
    attachments: [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉️ Email đã được gửi đi! MessageID: ${info.messageId}`);

  let previewUrl: string | false = false;
  if (useTestAccount) {
    previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`🔗 Link xem trước email (Ethereal): ${previewUrl}`);
  }

  return {
    success: true,
    previewUrl,
  };
}

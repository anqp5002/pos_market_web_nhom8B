# POS Market - Hệ Thống Quản Lý Bán Hàng Siêu Thị Thông Minh

Đồ án cuối kỳ môn học: INT1334 - Lập Trình Web
Giảng viên hướng dẫn: ThS. Lê Ngọc Hiếu
Nhóm thực hiện: Nhóm 8B

-------------------------------------------------------------------------------
1. GIỚI THIỆU TỔNG QUAN
-------------------------------------------------------------------------------
POS Market là một hệ thống phần mềm quản lý điểm bán hàng (Point of Sale) toàn
diện, được thiết kế theo kiến trúc Client-Server hiện đại. Dự án hướng tới việc
số hóa quy trình bán lẻ cho các siêu thị và cửa hàng tiện lợi, giúp tối ưu hóa
trải nghiệm của nhân viên thu ngân cũng như hỗ trợ quản lý hàng hóa một cách 
chặt chẽ, hạn chế thất thoát thông qua việc kết hợp các công nghệ tiên tiến nhất
bao gồm Trí tuệ nhân tạo (AI Chatbot) và Kiến trúc Ứng dụng Web Tiến tiến (PWA).

Dự án được xây dựng với mục tiêu áp dụng thực tế các kiến thức đã học trong 
môn Lập Trình Web vào một bài toán thực tế của doanh nghiệp.

-------------------------------------------------------------------------------
2. KIẾN TRÚC CÔNG NGHỆ (TECH STACK)
-------------------------------------------------------------------------------
Hệ thống được xây dựng dựa trên kiến trúc phân lớp với sự phân
tách rõ ràng giữa Frontend và Backend.

* Frontend:
  - Framework: Next.js 16 (App Router, Server Actions, Turbopack).
  - Ngôn ngữ: TypeScript strict mode.
  - State Management: Zustand (quản lý state giỏ hàng cục bộ hiệu quả).
  - Quản lý Form & Validate: React Hook Form kết hợp Zod.
  - UI/UX Styling: Tailwind CSS và Shadcn UI.
  - Hiệu năng: Tích hợp Progressive Web App (PWA) cho phép cài đặt và lưu cache offline.

* Backend:
  - Framework: Node.js với Express.js.
  - Ngôn ngữ: TypeScript.
  - ORM (Object-Relational Mapping): Prisma ORM.
  - Cơ sở dữ liệu: PostgreSQL.
  - Bảo mật (Authentication & Authorization): JSON Web Token (JWT) và Bcrypt.
  - Tiện ích thứ 3: Nodemailer (gửi email hóa đơn), Multer (upload hình ảnh).

* Trí tuệ nhân tạo (AI):
  - Model: Google Gemini 2.5 Flash API.
  - Ứng dụng: Chatbot hỗ trợ người dùng và Hệ thống gợi ý bán chéo (Cross-selling).

* Triển khai (Deployment) & DevOps:
  - Containerization: Docker và Docker Compose (quản lý cơ sở dữ liệu).
  - Hosting Frontend: Vercel.
  - Hosting Backend: Render.

-------------------------------------------------------------------------------
3. MÔ TẢ CHỨC NĂNG CHI TIẾT
-------------------------------------------------------------------------------
3.1. Chức năng Bán hàng (POS Core)
  - Giao diện bán hàng (Cashier Interface) được thiết kế tối ưu cho tốc độ thao tác.
  - Tính toán thời gian thực tổng tiền giỏ hàng, bao gồm Thuế VAT và Tiền thối lại.
  - Cho phép quét mã vạch (Barcode) để thêm nhanh sản phẩm vào giỏ.
  - Xuất hóa đơn dưới định dạng PDF, hoặc gửi trực tiếp Hóa đơn điện tử qua Email.

3.2. Quản lý Kho hàng và Sản phẩm
  - Phân loại sản phẩm theo danh mục (Categories).
  - Kiểm soát chặt chẽ số lượng tồn kho (Stock Tracking).
  - Hệ thống tự động phát cảnh báo hết hàng và khóa chức năng thanh toán khi tồn kho
    chạm mức 0 nhằm tránh tình trạng âm kho.

3.3. Quản lý Ca làm việc (Shift Management)
  - Nhân viên thu ngân bắt buộc phải Mở ca (Open Shift) và xác nhận số tiền ban
    đầu ca trước khi thực hiện bất kỳ giao dịch nào.
  - Đóng ca (Close Shift) cuối ngày để hệ thống tự động đối soát doanh thu lý
    thuyết và tiền mặt thực tế thu được, phát hiện chênh lệch nếu có.

3.4. Trợ lý ảo Trí tuệ Nhân tạo (AI Chatbot)
  - Tích hợp trực tiếp API của Google Gemini 2.5 Flash.
  - Giải đáp tự động các thắc mắc về cách sử dụng phần mềm.
  - Tự động phân tích giỏ hàng hiện tại và đưa ra 3 gợi ý sản phẩm mua kèm
    nhằm tăng giá trị đơn hàng (Cross-selling).

3.5. Bảo mật và Phân quyền
  - Phân quyền dựa trên Role-based Access Control (RBAC).
  - Role Admin: Toàn quyền quản trị nhân sự, kho hàng, xem thống kê doanh thu.
  - Role Cashier: Chỉ có quyền bán hàng, giao ca và xem lịch sử đơn hàng của bản thân.
  - Middleware bảo vệ xuyên suốt toàn bộ các API Endpoint quan trọng.

-------------------------------------------------------------------------------
4. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY TẠI LOCAL
-------------------------------------------------------------------------------
Yêu cầu kiên quyết: Máy tính cần cài đặt sẵn Node.js (phiên bản 18 trở lên) 
và Docker Desktop (hoặc PostgreSQL chạy ở cổng 5432).

BƯỚC 1: Khởi động Cơ sở dữ liệu PostgreSQL (Thông qua Docker)
Từ thư mục gốc của dự án, thực thi lệnh:
  docker-compose up -d

BƯỚC 2: Cấu hình và khởi chạy Backend
  cd backend
  npm install

  - Sao chép nội dung từ file .env.example (ở thư mục gốc) vào file .env trong backend.
  - Đảm bảo các key JWT_SECRET và GEMINI_API_KEY đã được điền đầy đủ.

  - Thiết lập cơ sở dữ liệu và nạp dữ liệu mẫu (Seed Data):
    npx prisma generate
    npx prisma db push
    npm run seed

  - Khởi chạy Server:
    npm run dev
    (Server backend sẽ hoạt động tại: http://localhost:4000)

BƯỚC 3: Cấu hình và khởi chạy Frontend
  Mở một cửa sổ Terminal khác:
  cd frontend
  npm install

  - Tạo file .env.local trong thư mục frontend và điền NEXT_PUBLIC_API_URL.
  - Khởi chạy Server Frontend:
    npm run dev
    (Giao diện website sẽ hoạt động tại: http://localhost:3000)

-------------------------------------------------------------------------------
5. TÀI KHOẢN KIỂM THỬ (TESTING ACCOUNTS)
-------------------------------------------------------------------------------
Hệ thống đã được nạp sẵn các tài khoản dưới đây sau khi chạy lệnh seed:

- Tài khoản Quản trị (Admin):
  Username: admin
  Password: password123

- Tài khoản Thu ngân (Cashier):
  Username: cashier1
  Password: password123

-------------------------------------------------------------------------------
6. GIẤY PHÉP SỬ DỤNG (LICENSE)
-------------------------------------------------------------------------------
Mã nguồn này được phát triển hoàn toàn vì mục đích học thuật và nghiên cứu 
để đáp ứng các yêu cầu của môn học Lập trình Web (INT1334).
Nghiêm cấm sử dụng dự án này cho bất kỳ mục đích thương mại nào khi chưa có 
sự đồng ý bằng văn bản từ nhóm tác giả.

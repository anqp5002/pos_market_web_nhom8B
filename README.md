# POS Market - Hệ Thống Quản Lý Bán Hàng Siêu Thị

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Prisma](https://img.shields.io/badge/ORM-Prisma-indigo)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC)

**POS Market** là một hệ thống quản lý điểm bán hàng (Point of Sale) dành cho siêu thị/cửa hàng tiện lợi, được xây dựng theo kiến trúc Client-Server hiện đại. Đây là dự án thực hành môn học **INT1334 - Lập Trình Web**.

Dự án chú trọng đến UI/UX, tốc độ phản hồi nhanh, thiết kế đáp ứng (Responsive) hỗ trợ đa thiết bị (Máy tính, Máy tính bảng, Điện thoại di động) và được xây dựng chuẩn theo các yêu cầu kỹ thuật của bài tập lớn.

---

##  Tính Năng Chính

Hệ thống bao gồm các Module tính năng sau:

1. **Bán hàng (POS - Dành cho Thu Ngân)**
   - Giao diện bán hàng trực quan, hỗ trợ tìm kiếm sản phẩm nhanh chóng.
   - Thêm vào giỏ hàng, tùy chỉnh số lượng, tự động tính tổng tiền (gồm cả Thuế VAT).
   - Thanh toán đa phương thức (Tiền mặt, Chuyển khoản, Thẻ).
   - **Tính năng nâng cao:** Xuất hóa đơn PDF và gửi Hóa đơn điện tử qua Email cho khách hàng.

2. **Quản lý Sản Phẩm & Kho Hàng**
   - Quản lý danh mục (Categories) và Sản phẩm (Products).
   - Kiểm soát số lượng tồn kho (Stock). Tự động cảnh báo hết hàng và không cho phép bán nếu tồn kho = 0.
   - Quét/Tạo mã vạch (Barcode) định danh sản phẩm.

3. **Quản lý Đơn Hàng & Giao Dịch**
   - Lưu trữ toàn bộ lịch sử hóa đơn bán hàng.
   - Xem chi tiết đơn hàng (Thời gian, Nhân viên lập, Sản phẩm mua, Khách hàng).
   - Quản lý trạng thái: Chờ thanh toán, Hoàn thành, Đã hủy (Hủy đơn tự động hoàn kho).

4. **Quản lý Khách Hàng**
   - Lưu trữ thông tin khách thân thiết (Tên, SĐT, Email).
   - Có thể chọn Khách lẻ (Vãng lai) hoặc Khách thành viên khi thanh toán.

5. **Quản lý Ca Làm Việc (Shift)**
   - Yêu cầu nhân viên mở ca (Open Shift) với số tiền đầu ca trước khi được phép bán hàng.
   - Tự động thống kê doanh thu thu ngân trong ca, tiền mặt thu được, tiền mặt chênh lệch.
   - Đóng ca (Close Shift) chốt sổ cuối ngày.

6. **Phân Quyền & Bảo Mật**
   - Xác thực bằng **JWT Token** (JSON Web Token) kết hợp mã hóa mật khẩu **Bcrypt**.
   - 2 Role chính: `Admin` (Toàn quyền quản lý hệ thống, nhân viên) và `Cashier` (Chỉ được bán hàng và xem đơn hàng của mình).
   - Middleware phân quyền độc lập tại Backend.

7. **Báo Cáo & AI (Phụ lục)**
   - Dashboard báo cáo doanh thu tổng quan theo ngày/tuần/tháng bằng biểu đồ (Recharts).
   - Top sản phẩm bán chạy.
   - Tích hợp AI cơ bản gợi ý sản phẩm bán chéo (Cross-selling).

---

## Công Nghệ Sử Dụng

### Frontend
- **Framework:** Next.js 14+ (App Router).
- **Ngôn ngữ:** TypeScript.
- **Styling:** Tailwind CSS, Shadcn UI, Lucide Icons.
- **State Management:** Zustand (Quản lý giỏ hàng cục bộ).
- **Tối ưu SEO:** Sử dụng `next/image` và ISR/SSG (`revalidate`, `metadata`).

### Backend
- **Runtime & Framework:** Node.js, Express.js.
- **Ngôn ngữ:** TypeScript.
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Authentication:** JWT, Bcrypt.
- **Tiện ích khác:** Nodemailer (Gửi Email), jsPDF (Tạo PDF Hóa đơn), Zod (Validate Payload), Jest & Supertest (Unit Test).

---

## Hướng Dẫn Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/en/) (phiên bản 18+).
- [PostgreSQL](https://www.postgresql.org/) (chạy ở port 5432) hoặc có chuỗi kết nối Database Cloud.

### 1. Khởi tạo Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd web_pos/backend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   - Copy file `.env.example` thành `.env`.
   - Cập nhật chuỗi kết nối PostgreSQL vào biến `DATABASE_URL`.
4. Cập nhật Database & Seed dữ liệu mẫu:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```
5. Chạy server Backend:
   ```bash
   npm run dev
   ```
   *(Server Backend sẽ khởi chạy tại: http://localhost:4000)*

### 2. Khởi tạo Frontend

1. Mở một Terminal khác, di chuyển vào thư mục frontend:
   ```bash
   cd web_pos/frontend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   - Copy file `.env.example` thành `.env.local`.
   - Kiểm tra `NEXT_PUBLIC_API_URL` (mặc định: http://localhost:4000/api).
4. Chạy server Frontend:
   ```bash
   npm run dev
   ```
   *(Giao diện web sẽ khả dụng tại: http://localhost:3000)*

---

## Tài Khoản Đăng Nhập Mẫu

Sau khi chạy lệnh `npm run seed` ở bước Backend, hệ thống sẽ có các tài khoản mặc định sau:

- **Admin (Quản trị viên):** 
  - Username: `admin`
  - Password: `password123`
- **Cashier (Thu ngân):** 
  - Username: `cashier1`
  - Password: `password123`

---

## Nhóm Thực Hiện

- **Nhóm:** Nhóm 8B
- **Môn học:** Lập Trình Web (INT1334)
- **Giảng viên hướng dẫn:** Ths. Lê Ngọc Hiếu

*Cảm ơn đã theo dõi và trải nghiệm ứng dụng của chúng em!*

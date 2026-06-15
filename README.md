# 🛒 POS Market - Hệ Thống Quản Lý Bán Hàng Siêu Thị Thông Minh

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-ORM-indigo?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI-FF6F00?style=for-the-badge&logo=google" alt="Google Gemini AI" />
</div>

<br />

**POS Market** là một hệ thống phần mềm quản lý điểm bán hàng (Point of Sale) toàn diện, được thiết kế theo chuẩn kiến trúc Client-Server hiện đại. Dự án hướng tới việc số hóa quy trình bán lẻ cho các siêu thị và cửa hàng tiện lợi, tối ưu hóa trải nghiệm Thu ngân và Khách hàng với các công nghệ tiên tiến nhất như Trí tuệ nhân tạo (AI) và Progressive Web App (PWA).

🎓 **Dự án Đồ án Cuối kỳ môn học: INT1334 - Lập Trình Web**  
👨‍🏫 **Giảng viên hướng dẫn:** ThS. Lê Ngọc Hiếu  
👥 **Thực hiện bởi:** Nhóm 8B  

---

## 🚀 Tính Năng Nổi Bật (Key Features)

### 1. 🤖 Trợ Lý Ảo AI (Gemini 2.5 Flash Integration)
- Tích hợp trực tiếp Google Gemini 2.5 Flash thông qua API.
- Chatbot thông minh hỗ trợ giải đáp thắc mắc, hướng dẫn sử dụng phần mềm cho người dùng mới.
- Tính năng AI gợi ý bán chéo sản phẩm (Cross-selling) tự động dựa trên giỏ hàng hiện tại để tối ưu hóa doanh thu.

### 2. 📱 Trải Nghiệm Ứng Dụng Đa Nền Tảng (PWA)
- Hỗ trợ **Progressive Web App (PWA)**, cho phép cài đặt trực tiếp phần mềm lên màn hình chính của Điện thoại/Máy tính bảng/PC như một ứng dụng Native độc lập.
- Giao diện Responsive hoàn toàn 100%, tự động thích ứng với thiết bị của Thu ngân.

### 3. 💳 Chức Năng Bán Hàng (POS Core)
- Giao diện bán hàng tốc độ cao, hỗ trợ thao tác chuột và cảm ứng mượt mà.
- Tính toán Giỏ hàng, Thuế VAT, Tiền thối lại theo thời gian thực (Real-time).
- Quét/Nhập mã vạch sản phẩm (Barcode).
- Xuất hóa đơn định dạng PDF và Gửi Hóa đơn điện tử tự động qua Email cho Khách hàng.

### 4. 📦 Quản Lý Kho & Vận Hành
- **Quản lý Sản phẩm:** Thêm, sửa, xóa, tìm kiếm, lọc theo Danh mục. Cảnh báo hết hàng tự động khi Tồn kho = 0.
- **Quản lý Đơn hàng:** Lưu trữ lịch sử giao dịch, cho phép hoàn hủy đơn và tự động hoàn trả số lượng sản phẩm vào kho.
- **Quản lý Ca làm việc (Shift Management):** Bắt buộc Thu ngân mở ca (chốt tiền đầu ngày) và Đóng ca (đối soát tiền mặt cuối ngày) để chống thất thoát.

### 5. 🛡️ Bảo Mật & Phân Quyền (Security)
- Hệ thống phân quyền chặt chẽ thông qua JWT (JSON Web Tokens) và Bcrypt.
- Gồm 2 Role chính:
  - `Admin`: Toàn quyền quản trị hệ thống, nhân sự, xem báo cáo doanh thu tổng.
  - `Cashier`: Bán hàng tại quầy, quản lý đơn cá nhân, giao ca.
- Middleware bảo vệ toàn bộ API Endpoint.

---

## 🛠️ Kiến Trúc Công Nghệ (Tech Stack)

* **Frontend:** Next.js 16 (App Router, Server Actions), React Hook Form + Zod, Zustand (State Management), Tailwind CSS, Shadcn UI, Recharts (Biểu đồ).
* **Backend:** Node.js, Express.js, TypeScript, JWT, Bcrypt, Multer (Upload file), Nodemailer.
* **Cơ Sở Dữ Liệu:** PostgreSQL, Prisma ORM.
* **Cơ Sở Hạ Tầng:** Docker & Docker Compose (cho Database Local), Vercel (FE Deployment), Render (BE Deployment).

---

## 💻 Hướng Dẫn Cài Đặt (Quick Start)

Yêu cầu hệ thống: **Node.js 18+** và **Docker Desktop** (hoặc cài sẵn PostgreSQL).

### Bước 1: Khởi động Cơ Sở Dữ Liệu bằng Docker
Từ thư mục gốc (nơi chứa file `docker-compose.yml`), chạy lệnh:
\`\`\`bash
docker-compose up -d
\`\`\`
*(Hệ thống sẽ tự động pull image PostgreSQL và mở cổng 5432).*

### Bước 2: Cài đặt và cấu hình Backend
\`\`\`bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt thư viện
npm install

# Cấu hình biến môi trường
cp .env.example .env
# (Lưu ý: Mở file .env và điền GEMINI_API_KEY nếu muốn dùng tính năng AI)

# Khởi tạo Database và nạp dữ liệu mẫu
npx prisma generate
npx prisma db push
npm run seed

# Khởi chạy Backend Server (Port 4000)
npm run dev
\`\`\`

### Bước 3: Cài đặt và khởi chạy Frontend
Mở một Terminal mới:
\`\`\`bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt thư viện
npm install

# Khởi chạy Frontend Server (Port 3000)
# (Đã config --webpack để tương thích Next.js 16 và next-pwa)
npm run dev
\`\`\`
Truy cập **http://localhost:3000** để sử dụng ứng dụng.

---

## 🔑 Tài Khoản Truy Cập Mẫu
Sau khi chạy lệnh `npm run seed`, hệ thống đã có sẵn dữ liệu test:
- **Tài khoản Quản trị (Admin):** 
  - User: `admin` | Mật khẩu: `123456`
- **Tài khoản Thu ngân (Cashier):** 
  - User: `cashier1` | Mật khẩu: `123456`

---

## 📜 Giấy Phép (License)
Dự án được phát triển phục vụ mục đích học thuật và nghiên cứu cho môn học Lập Trình Web (INT1334). Không sử dụng cho mục đích thương mại khi chưa có sự đồng ý của nhóm tác giả.

# POS Market - Backend

Đây là thư mục chứa mã nguồn Backend của dự án **POS Market**, cung cấp các API RESTful phục vụ cho hệ thống quản lý siêu thị.

## 🚀 Hướng dẫn khởi chạy

Đầu tiên, hãy cài đặt các thư viện phụ thuộc:

```bash
npm install
```

Tạo file `.env` dựa trên `.env.example` (nếu có) hoặc sao chép từ cấu hình của bạn, đảm bảo điền đầy đủ `DATABASE_URL`, `JWT_SECRET` và `GEMINI_API_KEY`.

Tiếp theo, khởi tạo cơ sở dữ liệu và nạp dữ liệu mẫu:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

Cuối cùng, khởi chạy server ở chế độ phát triển (development):

```bash
npm run dev
```

Server sẽ hoạt động mặc định tại: `http://localhost:4000`.

## 🛠️ Công nghệ sử dụng

- **Môi trường chạy (Runtime):** Node.js
- **Khung ứng dụng (Framework):** Express.js
- **Ngôn ngữ:** TypeScript
- **Cơ sở dữ liệu:** PostgreSQL
- **ORM:** Prisma
- **Bảo mật:** JWT (JSON Web Token), bcryptjs
- **Xử lý tệp (Upload):** Multer
- **Trí tuệ nhân tạo (AI):** @google/generative-ai (Gemini 2.5 Flash API)

## 📁 Cấu trúc thư mục

- `src/controllers`: Xử lý logic nghiệp vụ cho từng API route.
- `src/routes`: Định nghĩa các API endpoints.
- `src/middleware`: Chứa các middleware (kiểm tra token, phân quyền, xử lý lỗi).
- `src/services`: Tương tác trực tiếp với Database qua Prisma.
- `prisma`: Chứa sơ đồ cơ sở dữ liệu (`schema.prisma`) và script tạo dữ liệu mẫu (`seed.ts`).

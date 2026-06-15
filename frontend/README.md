# POS Market - Frontend

Đây là thư mục chứa mã nguồn Frontend của dự án **POS Market**, được xây dựng bằng [Next.js](https://nextjs.org/) phiên bản 14+ (App Router).

## 🚀 Hướng dẫn khởi chạy

Đầu tiên, hãy cài đặt các thư viện phụ thuộc:

```bash
npm install
```

Sau đó, khởi chạy server ở chế độ phát triển (development):

```bash
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.

Bạn có thể bắt đầu chỉnh sửa giao diện bằng cách thay đổi các file trong thư mục `src/app`. Trang sẽ tự động tải lại khi bạn lưu file.

## 🛠️ Công nghệ sử dụng

- **Khung ứng dụng (Framework):** Next.js (App Router)
- **Ngôn ngữ:** TypeScript
- **Quản lý trạng thái (State Management):** Zustand
- **Giao diện & Cấu trúc (UI/UX):** Tailwind CSS, Shadcn UI, Lucide Icons
- **Gọi API:** Fetch API (kết hợp với Token JWT)
- **PWA:** Hỗ trợ cài đặt ứng dụng web trên thiết bị di động và desktop.

## 📦 Triển khai (Deploy)

Ứng dụng Frontend này được thiết kế để triển khai dễ dàng nhất trên nền tảng [Vercel](https://vercel.com/). 
Xem thêm tài liệu chi tiết tại [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

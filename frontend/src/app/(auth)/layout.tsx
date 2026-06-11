import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - POS Market",
  description: "Đăng nhập vào hệ thống POS Siêu thị",
};

// === SSG: Static Site Generation ===
// Yêu cầu (Hạng mục #3): Trang Login không chứa dữ liệu động thay đổi theo request,
// nên Next.js sẽ tự động build trang này thành HTML tĩnh (SSG) lúc `next build`.
// Việc này giúp trang Đăng nhập load cực nhanh (0ms) và chịu tải cực lớn.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {children}
    </div>
  );
}

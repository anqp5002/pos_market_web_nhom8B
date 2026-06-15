import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: {
    template: "%s | POS Market",
    default: "POS Market - Hệ Thống Quản Lý Bán Hàng Siêu Thị & POS",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "POS Market",
  },
  description: "POS Market - Phần mềm quản lý bán hàng, doanh thu, ca làm việc, hàng tồn kho và in hóa đơn thời gian thực tốt nhất cho cửa hàng của bạn.",
  keywords: ["POS", "phần mềm bán hàng", "quản lý siêu thị", "hóa đơn điện tử", "quản lý doanh thu", "POS Market"],
  authors: [{ name: "Nhom 8B" }],
  openGraph: {
    title: "POS Market - Hệ Thống Quản Lý Bán Hàng Siêu Thị",
    description: "Phần mềm quản lý bán hàng POS toàn diện, nhanh chóng, hiệu quả và có thể hoạt động offline.",
    url: "https://pos-market.vercel.app",
    siteName: "POS Market",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "POS Market - Hệ Thống Quản Lý Bán Hàng Siêu Thị",
    description: "Phần mềm quản lý bán hàng POS toàn diện, nhanh chóng, hiệu quả.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

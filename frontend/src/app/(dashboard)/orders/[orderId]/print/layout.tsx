// Layout riêng cho trang in — không có sidebar, header hay bất kỳ UI nào
// Trang in cần HTML sạch hoàn toàn để `window.print()` hoạt động đúng
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return children;
}

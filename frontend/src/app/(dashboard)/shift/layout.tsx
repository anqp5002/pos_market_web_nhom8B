import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Ca Làm Việc - POS Market",
  description: "Theo dõi mở ca, đóng ca, và dòng tiền trong ca làm việc",
};

export default function ShiftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

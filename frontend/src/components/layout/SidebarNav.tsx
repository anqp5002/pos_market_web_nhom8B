'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  UserCog,
  FileText, 
  Clock, 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  isAdmin: boolean;
}

export default function SidebarNav({ isAdmin }: SidebarNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "#", icon: LayoutDashboard, label: "Dashboard (Sắp ra mắt)" },
    { href: "/pos", icon: ShoppingCart, label: "Bán Hàng" },
    { href: "#orders", icon: FileText, label: "Đơn Hàng" },
    { href: "/products", icon: Package, label: "Sản Phẩm" },
    { href: "#customers", icon: Users, label: "Khách Hàng" },
  ];

  if (isAdmin) {
    links.push({ href: "/employees", icon: UserCog, label: "Nhân Viên" });
  }

  links.push({ href: "#shifts", icon: Clock, label: "Ca Làm Việc" });

  return (
    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
      {links.map((link, idx) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        const isPlaceholder = link.href.startsWith('#');
        return (
          <Link
            key={idx}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive && !isPlaceholder
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

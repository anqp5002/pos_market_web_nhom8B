import { Metadata } from "next";
import ProductGrid from "@/components/pos/ProductGrid";
import CartSidebar from "@/components/cart/CartSidebar";
import { authFetch } from "@/lib/api";

export const metadata: Metadata = {
  title: "Bán Hàng (POS) - POS Market",
  description: "Màn hình bán hàng nhanh, quét mã vạch và thanh toán",
};
// Server Component: fetch data từ Backend (có JWT token)
async function getProducts() {
  try {
    const data = await authFetch<{ success: boolean; data: any[] }>("/products", {
      cache: "no-store",
    });
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function PosPage() {
  const products = await getProducts();

  // Trích xuất danh sách category duy nhất
  const categories = [
    ...new Set(products.map((p: any) => p.category?.name).filter(Boolean)),
  ] as string[];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full lg:h-[calc(100vh-5rem)]">
      {/* Cột trái: Sản phẩm (70% trên desktop) */}
      <div className="flex-[7] min-w-0 h-[60vh] lg:h-full">
        <ProductGrid products={products} categories={categories} />
      </div>

      {/* Cột phải: Giỏ hàng (30% trên desktop) */}
      <div className="flex-[3] min-w-0 lg:min-w-[320px] lg:max-w-[400px] h-auto lg:h-full">
        <CartSidebar />
      </div>
    </div>
  );
}


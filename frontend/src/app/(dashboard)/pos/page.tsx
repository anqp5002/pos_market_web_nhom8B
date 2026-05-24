import ProductGrid from "@/components/pos/ProductGrid";
import CartSidebar from "@/components/cart/CartSidebar";
import { authFetch } from "@/lib/api";

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
    <div className="flex gap-4 h-[calc(100vh-5rem)]">
      {/* Cột trái: Sản phẩm (70%) */}
      <div className="flex-[7] min-w-0">
        <ProductGrid products={products} categories={categories} />
      </div>

      {/* Cột phải: Giỏ hàng (30%) */}
      <div className="flex-[3] min-w-[320px] max-w-[400px]">
        <CartSidebar />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getSuppliers, createProduct } from "@/lib/actions/products";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    getCategories(),
    getSuppliers(),
  ]);

  const flatCategories = categories.flatMap((c) => [
    { id: c.id, name: c.name },
    ...c.children.map((child) => ({ id: child.id, name: `${c.name} / ${child.name}` })),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/admin/products" className="hover:text-black">
          מוצרים
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span>מוצר חדש</span>
      </div>

      <h1 className="text-2xl font-bold">מוצר חדש</h1>

      <ProductForm
        categories={flatCategories}
        suppliers={suppliers}
        action={async (formData) => {
          "use server";
          return createProduct(formData);
        }}
      />
    </div>
  );
}

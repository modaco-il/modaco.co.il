import { ProductForm } from "@/components/admin/product-form";
import { VariantManager } from "@/components/admin/variant-manager";
import {
  getProduct,
  getCategories,
  getSuppliers,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/products";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, suppliers] = await Promise.all([
    getProduct(id),
    getCategories(),
    getSuppliers(),
  ]);

  const flatCategories = categories.flatMap((c) => [
    { id: c.id, name: c.name },
    ...c.children.map((child) => ({
      id: child.id,
      name: `${c.name} / ${child.name}`,
    })),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/admin/products" className="hover:text-black">
          מוצרים
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span>{product.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <DeleteProductButton
          productId={id}
          onDelete={async () => {
            "use server";
            await deleteProduct(id);
            redirect("/admin/products");
          }}
        />
      </div>

      <ProductForm
        product={product}
        categories={flatCategories}
        suppliers={suppliers}
        action={async (formData) => {
          "use server";
          return updateProduct(id, formData);
        }}
      />

      {/* Variants */}
      <VariantManager
        productId={id}
        variants={product.variants}
        basePrice={product.basePrice}
      />

      {/* Cross-sell */}
      {product.crossSellFrom.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold mb-2">
            מוצרים משלימים ({product.crossSellFrom.length})
          </h3>
          <div className="space-y-2">
            {product.crossSellFrom.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-3 text-sm"
              >
                <span>{rule.relatedProduct.name}</span>
                <span className="text-gray-400">({rule.ruleType})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

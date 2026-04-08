export const dynamic = "force-dynamic";

import { getCategories, createCategory } from "@/lib/actions/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/components/admin/category-form";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">קטגוריות</h1>
      </div>

      {/* Add Category */}
      <CategoryForm
        action={async (formData) => {
          "use server";
          return createCategory(formData);
        }}
      />

      {/* Category Tree */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold">{cat.name}</span>
                  <span className="text-sm text-gray-400 mr-2">
                    /{cat.slug}
                  </span>
                </div>
                <Badge variant="secondary">{cat._count.products} מוצרים</Badge>
              </div>

              {/* Children */}
              {cat.children.length > 0 && (
                <div className="mt-3 mr-6 space-y-2">
                  {cat.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="text-sm">{child.name}</span>
                        <span className="text-xs text-gray-400 mr-2">
                          /{child.slug}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {child._count.products}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

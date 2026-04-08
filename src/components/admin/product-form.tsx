"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductData {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  supplierId: string | null;
  supplierUrl: string | null;
  supplierSku: string | null;
  basePrice: number;
  costPrice: number | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  featured: boolean;
}

interface ProductFormProps {
  product?: ProductData;
  categories: Category[];
  suppliers: Supplier[];
  action: (formData: FormData) => Promise<{ success: boolean; id?: string }>;
}

function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductForm({
  product,
  categories,
  suppliers,
  action,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      try {
        const result = await action(formData);
        return result;
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי מוצר</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם המוצר *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
                onChange={(e) => {
                  if (!product) {
                    const slugInput = document.getElementById(
                      "slug"
                    ) as HTMLInputElement;
                    if (slugInput) slugInput.value = generateSlug(e.target.value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (כתובת URL) *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={product?.slug}
                required
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description || ""}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">קטגוריה</Label>
              <Select
                name="categoryId"
                defaultValue={product?.categoryId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select name="status" defaultValue={product?.status || "DRAFT"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">טיוטה</SelectItem>
                  <SelectItem value="ACTIVE">פעיל</SelectItem>
                  <SelectItem value="ARCHIVED">ארכיון</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>תמחור</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">מחיר קמעונאי (₪) *</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.basePrice}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">מחיר עלות (₪)</Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.costPrice || ""}
                dir="ltr"
              />
            </div>
          </div>
          {product?.costPrice && product.basePrice > 0 && (
            <p className="text-sm text-gray-500">
              רווח גולמי:{" "}
              {Math.round(
                ((product.basePrice - product.costPrice) / product.basePrice) *
                  100
              )}
              %
            </p>
          )}
        </CardContent>
      </Card>

      {/* Supplier */}
      <Card>
        <CardHeader>
          <CardTitle>ספק</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">ספק</Label>
              <Select
                name="supplierId"
                defaultValue={product?.supplierId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר ספק" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierUrl">קישור לאתר הספק</Label>
              <Input
                id="supplierUrl"
                name="supplierUrl"
                type="url"
                defaultValue={product?.supplierUrl || ""}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierSku">מק&quot;ט ספק</Label>
              <Input
                id="supplierSku"
                name="supplierSku"
                defaultValue={product?.supplierSku || ""}
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>קידום אורגני (SEO)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">כותרת SEO</Label>
            <Input
              id="seoTitle"
              name="seoTitle"
              defaultValue={product?.seoTitle || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription">תיאור SEO</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              defaultValue={product?.seoDescription || ""}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              value="true"
              defaultChecked={product?.featured}
              className="rounded"
            />
            <Label htmlFor="featured">מוצר מומלץ (יופיע בדף הבית)</Label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-20 lg:bottom-0 bg-gray-50 p-4 -mx-4 rounded-lg">
        <Button type="submit" disabled={isPending} className="flex-1 lg:flex-none">
          {isPending
            ? "שומר..."
            : product
              ? "עדכן מוצר"
              : "צור מוצר"}
        </Button>
        {state && !state.success && "error" in state && (
          <p className="text-red-600 text-sm self-center">{state.error as string}</p>
        )}
      </div>
    </form>
  );
}

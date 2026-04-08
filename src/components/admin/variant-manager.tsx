"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { addVariant, updateVariant, deleteVariant } from "@/lib/actions/products";

interface Variant {
  id: string;
  name: string;
  sku: string;
  priceOverride: number | null;
  costPrice: number | null;
  stockStore: number;
  stockSupplier: number;
  stockStatus: string;
  weight: number | null;
  isDefault: boolean;
}

interface VariantManagerProps {
  productId: string;
  variants: Variant[];
  basePrice: number;
}

const stockStatusLabels: Record<string, string> = {
  IN_STOCK: "במלאי",
  AT_SUPPLIER: "אצל ספק",
  ON_ORDER: "בהזמנה",
  OUT_OF_STOCK: "אזל",
};

const stockStatusColors: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  AT_SUPPLIER: "bg-blue-100 text-blue-700",
  ON_ORDER: "bg-yellow-100 text-yellow-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};

export function VariantManager({
  productId,
  variants,
  basePrice,
}: VariantManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    await addVariant(productId, formData);
    setShowForm(false);
  }

  async function handleUpdate(formData: FormData) {
    if (!editingId) return;
    await updateVariant(editingId, formData);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את הוריאנט?")) return;
    await deleteVariant(id);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>וריאנטים ({variants.length})</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
        >
          <Plus className="w-4 h-4 ml-1" />
          הוסף וריאנט
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add/Edit Form */}
        {(showForm || editingId) && (
          <form
            action={editingId ? handleUpdate : handleAdd}
            className="bg-blue-50 p-4 rounded-lg space-y-3"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">שם *</Label>
                <Input
                  name="name"
                  placeholder='לדוגמה: "ברונזה"'
                  defaultValue={
                    editingId
                      ? variants.find((v) => v.id === editingId)?.name
                      : ""
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SKU *</Label>
                <Input
                  name="sku"
                  placeholder="MOD-001-BRZ"
                  dir="ltr"
                  defaultValue={
                    editingId
                      ? variants.find((v) => v.id === editingId)?.sku
                      : ""
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">מחיר (₪)</Label>
                <Input
                  name="priceOverride"
                  type="number"
                  step="0.01"
                  placeholder={`${basePrice} (ברירת מחדל)`}
                  dir="ltr"
                  defaultValue={
                    editingId
                      ? variants.find((v) => v.id === editingId)?.priceOverride || ""
                      : ""
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">סטטוס מלאי</Label>
                <Select
                  name="stockStatus"
                  defaultValue={
                    editingId
                      ? variants.find((v) => v.id === editingId)?.stockStatus
                      : "IN_STOCK"
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_STOCK">במלאי</SelectItem>
                    <SelectItem value="AT_SUPPLIER">אצל ספק</SelectItem>
                    <SelectItem value="ON_ORDER">בהזמנה</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">אזל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">מלאי בחנות</Label>
                <Input
                  name="stockStore"
                  type="number"
                  min="0"
                  dir="ltr"
                  defaultValue={
                    editingId
                      ? variants.find((v) => v.id === editingId)?.stockStore
                      : "0"
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">מלאי אצל ספק</Label>
                <Input
                  name="stockSupplier"
                  type="number"
                  min="0"
                  dir="ltr"
                  defaultValue={
                    editingId
                      ? variants.find((v) => v.id === editingId)?.stockSupplier
                      : "0"
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">משקל (ק&quot;ג)</Label>
                <Input
                  name="weight"
                  type="number"
                  step="0.01"
                  dir="ltr"
                  defaultValue={
                    editingId
                      ? variants.find((v) => v.id === editingId)?.weight || ""
                      : ""
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {editingId ? "עדכן" : "הוסף"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                ביטול
              </Button>
            </div>
          </form>
        )}

        {/* Variant List */}
        {variants.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{v.name}</span>
                <span className="text-xs text-gray-400 font-mono">{v.sku}</span>
                {v.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    ברירת מחדל
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span>₪{v.priceOverride || basePrice}</span>
                <span>חנות: {v.stockStore}</span>
                <span>ספק: {v.stockSupplier}</span>
                <Badge className={`text-xs ${stockStatusColors[v.stockStatus]}`}>
                  {stockStatusLabels[v.stockStatus]}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingId(v.id);
                  setShowForm(false);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600"
                onClick={() => handleDelete(v.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {variants.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 text-center py-4">
            אין וריאנטים עדיין. הוסף את הוריאנט הראשון.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

// TODO: Replace with real data
const mockProducts = [
  {
    id: "1",
    name: 'ציר קליפ-טופ 107 מעלות "Blum"',
    category: "צירים",
    basePrice: 45,
    status: "ACTIVE" as const,
    stockTotal: 120,
    image: null,
  },
  {
    id: "2",
    name: "ברז מטבח דגם לינוס Blanco",
    category: "ברזי מטבח",
    basePrice: 890,
    status: "DRAFT" as const,
    stockTotal: 8,
    image: null,
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "טיוטה", className: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "פעיל", className: "bg-green-100 text-green-700" },
  ARCHIVED: { label: "ארכיון", className: "bg-red-100 text-red-700" },
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מוצרים</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            מוצר חדש
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="חיפוש מוצרים..." className="pr-10" />
      </div>

      {/* Product List — Mobile-optimized cards */}
      <div className="space-y-3">
        {mockProducts.map((product) => (
          <Link key={product.id} href={`/admin/products/${product.id}`}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Image placeholder */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                    תמונה
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.category}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={statusConfig[product.status].className}
                      >
                        {statusConfig[product.status].label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        מלאי: {product.stockTotal}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-left font-bold">
                    ₪{product.basePrice}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

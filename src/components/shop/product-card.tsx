import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        תמונה
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-xs text-gray-500">{product.category}</div>
        <h3 className="font-medium text-sm mt-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg">₪{product.price}</span>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

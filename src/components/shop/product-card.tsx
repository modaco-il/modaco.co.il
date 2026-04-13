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
      className="group bg-white dark:bg-gray-950 rounded-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-mocha dark:hover:border-mocha hover:shadow-md transition-all"
    >
      <div className="aspect-square bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {product.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700 text-xs">
            ללא תמונה
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-xs text-mocha truncate">{product.category}</div>
        <h3 className="font-medium text-sm mt-1 line-clamp-2 min-h-[2.5rem] text-gray-900 dark:text-gray-100">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">₪{product.price}</span>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";

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
      className="group block"
    >
      <div className="aspect-square img-frame relative overflow-hidden border border-bone group-hover:border-mocha/40 transition-colors">
        {product.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-6 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft/30 text-xs tracking-widest uppercase">
            ללא תמונה
          </div>
        )}
      </div>

      <div className="pt-5 pb-2">
        <div className="text-[10px] tracking-[0.25em] uppercase text-mocha mb-2">
          {product.category}
        </div>
        <h3 className="font-display text-lg text-ink leading-snug min-h-[3rem] line-clamp-2 group-hover:text-mocha transition-colors">
          {product.name}
        </h3>
        <div className="mt-3 text-sm text-ink-soft font-light">
          ₪{product.price.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}

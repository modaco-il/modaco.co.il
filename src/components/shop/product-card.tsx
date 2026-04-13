import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: string;
    colors?: string[]; // variant names like "ניקל מוברש", "שחור מט"
  };
  featured?: boolean;
}

// Hebrew finish/color name → hex (best-effort palette)
const COLOR_MAP: Record<string, string> = {
  "ניקל מוברש": "#B8B5AE",
  "ניקל": "#C0C0C0",
  "כרום ניקל": "#D4D4D4",
  "כרום": "#D4D4D4",
  "נירוסטה מט": "#B5B5B5",
  "נירוסטה": "#C5C5C5",
  "שחור מט": "#1A1A1A",
  "שחור": "#000000",
  "גרפיט": "#383838",
  "אפור": "#888888",
  "לבן מט": "#F0F0F0",
  "לבן": "#FAFAFA",
  "זהב מט": "#C9A57A",
  "זהב": "#D4AF37",
  "רוז גולד": "#B76E79",
  "שמפניה": "#F7E7CE",
  "סטנדרט": "#D9C3A5",
};

function colorHex(name: string): string {
  const trimmed = name.trim();
  if (COLOR_MAP[trimmed]) return COLOR_MAP[trimmed];
  // partial match
  for (const key of Object.keys(COLOR_MAP)) {
    if (trimmed.includes(key)) return COLOR_MAP[key];
  }
  return "#D9C3A5";
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const visibleColors = (product.colors || []).slice(0, 5);
  const moreCount = (product.colors?.length || 0) - visibleColors.length;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full"
    >
      <div className={`img-frame relative overflow-hidden border border-bone group-hover:border-mocha/40 transition-colors ${featured ? "aspect-[4/5]" : "aspect-square"}`}>
        {product.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-700 ease-out ${featured ? "p-12 lg:p-20" : "p-6"}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs tracking-widest uppercase opacity-30">
            ללא תמונה
          </div>
        )}

        {/* Featured eyebrow badge */}
        {featured && (
          <div className="absolute top-5 right-5 bg-ink text-cream text-[10px] tracking-[0.32em] uppercase px-3 py-1.5">
            Maison Pick
          </div>
        )}
      </div>

      <div className="pt-5 pb-2">
        <div className="text-[10px] tracking-[0.25em] uppercase text-mocha mb-2">
          {product.category}
        </div>
        <h3 className={`font-display font-bold text-ink leading-snug line-clamp-2 group-hover:text-mocha transition-colors ${featured ? "text-2xl lg:text-3xl min-h-[3.5rem]" : "text-lg min-h-[3rem]"}`}>
          {product.name}
        </h3>

        {/* Color swatches */}
        {visibleColors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {visibleColors.map((c, i) => (
              <span
                key={i}
                title={c}
                className="block w-3 h-3 rounded-full border border-bone"
                style={{ backgroundColor: colorHex(c) }}
              />
            ))}
            {moreCount > 0 && (
              <span className="text-[10px] text-ink-soft tracking-wider mr-1">+{moreCount}</span>
            )}
          </div>
        )}

        <div className="mt-3 text-sm text-ink-soft font-light">
          ₪{product.price.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}

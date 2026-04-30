import Link from "next/link";
import { SafeImage } from "@/components/shop/safe-image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    /** true = full-bleed lifestyle photo → object-cover, no padding */
    imageIsLifestyle?: boolean;
    category: string;
    categorySlug?: string;
    colors?: string[]; // variant names like "ניקל מוברש", "שחור מט"
  };
  featured?: boolean;
}

const HIDE_PRICE_CATEGORY_SLUGS = new Set(["faucets", "faucets-blanco", "faucets-delta"]);
const QUOTE_ONLY_CATEGORY_SLUGS = new Set(["cladding"]);
function shouldHidePrice(slug: string | undefined, name: string, price: number): boolean {
  if (slug && HIDE_PRICE_CATEGORY_SLUGS.has(slug)) return true;
  if (slug && QUOTE_ONLY_CATEGORY_SLUGS.has(slug)) return true;
  if (!price || price <= 0) return true;
  return /ברזי|ברז(?:ים)?/.test(name);
}
function priceLabel(slug: string | undefined): string {
  if (slug && QUOTE_ONLY_CATEGORY_SLUGS.has(slug)) return "להצעת מחיר";
  return "הנחה משמעותית בסניף";
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
  "ברונזה": "#8C5A3C",
  "פליז": "#B5A642",
  "נחושת": "#B87333",
  "טיטניום": "#878681",
  "אנתרציט": "#2E2E2E",
};

const SIZE_PATTERNS = [
  /^\s*גודל\s*\d+/,
  /^\s*מידה\s*\d+/,
  /\d+\s*(מ"?מ|ס"?מ|ק"?ג|mm|cm|kg)\b/i,
  /^\d{2,}(\.\d+)?$/,
];

function isColorName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (SIZE_PATTERNS.some((re) => re.test(trimmed))) return false;
  if (COLOR_MAP[trimmed]) return true;
  return Object.keys(COLOR_MAP).some((key) => trimmed.includes(key));
}

function colorHex(name: string): string {
  const trimmed = name.trim();
  if (COLOR_MAP[trimmed]) return COLOR_MAP[trimmed];
  for (const key of Object.keys(COLOR_MAP)) {
    if (trimmed.includes(key)) return COLOR_MAP[key];
  }
  return "#D9C3A5";
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const allVariants = product.colors || [];
  const colorVariants = allVariants.filter(isColorName);
  const visibleColors = colorVariants.slice(0, 5);
  const moreCount = colorVariants.length - visibleColors.length;
  const sizeCount = allVariants.length - colorVariants.length;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col h-full"
    >
      <div className={`img-frame relative overflow-hidden border border-bone group-hover:border-mocha/40 transition-colors ${
        product.imageIsLifestyle ? "" : "bg-white"
      } ${featured ? "flex-1 min-h-0" : "aspect-square shrink-0"}`}>
        {product.image ? (
          <SafeImage
            src={product.image}
            alt={product.name}
            fill
            sizes={featured ? "(max-width: 1024px) 50vw, 40vw" : "(max-width: 1024px) 50vw, 25vw"}
            className={
              product.imageIsLifestyle
                ? "object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                : `object-contain group-hover:scale-[1.04] transition-transform duration-700 ease-out ${featured ? "p-12 lg:p-20" : "p-6"}`
            }
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

      <div className="pt-5 pb-2 shrink-0">
        <div className="text-[10px] tracking-[0.25em] uppercase text-mocha mb-2">
          {product.category}
        </div>
        <h3 className={`font-display font-bold text-ink leading-snug line-clamp-2 group-hover:text-mocha transition-colors ${featured ? "text-2xl lg:text-3xl min-h-[3.5rem]" : "text-lg min-h-[3rem]"}`}>
          {product.name}
        </h3>

        {/* Color swatches + size count */}
        {(visibleColors.length > 0 || sizeCount > 0) && (
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
            {sizeCount > 0 && (
              <span className="text-[10px] text-ink-soft tracking-wider mr-auto">
                {sizeCount} מידות
              </span>
            )}
          </div>
        )}

        <div className="mt-3 text-sm text-ink-soft font-light">
          {shouldHidePrice(product.categorySlug, product.category, product.price) ? (
            <span className="text-mocha">{priceLabel(product.categorySlug)}</span>
          ) : (
            <>₪{product.price.toLocaleString()}</>
          )}
        </div>
      </div>
    </Link>
  );
}

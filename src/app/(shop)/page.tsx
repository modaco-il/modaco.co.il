import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";

const featuredCategories = [
  {
    slug: "hinges",
    name: "צירים Blum",
    description: "צירים מתקדמים לכל סוגי הארונות",
    image: null,
  },
  {
    slug: "slides",
    name: "מסילות מובנטו",
    description: "מסילות שקטות וחלקות",
    image: null,
  },
  {
    slug: "faucets",
    name: "ברזי מטבח",
    description: "ברזים מעוצבים מ-Blanco ו-Delta",
    image: null,
  },
  {
    slug: "handles",
    name: "ידיות",
    description: "ידיות מעוצבות למטבח ולריהוט",
    image: null,
  },
  {
    slug: "accessories",
    name: "אקססוריז לבית",
    description: "אגרטלים, מראות, כלי בישול ועוד",
    image: null,
  },
  {
    slug: "lift-systems",
    name: "מנגנוני הרמה",
    description: "פתרונות הרמה לקלפות ומיקרו",
    image: null,
  },
];

// TODO: Replace with real data
const featuredProducts = [
  {
    id: "1",
    name: 'ציר קליפ-טופ 110 מעלות "Blum"',
    slug: "clip-top-110-blum",
    price: 45,
    image: null,
    category: "צירים",
  },
  {
    id: "2",
    name: "ברז מטבח דגם לינוס Blanco",
    slug: "linus-blanco-faucet",
    price: 890,
    image: null,
    category: "ברזי מטבח",
  },
  {
    id: "3",
    name: "מובנטו בלומושן עומק 50",
    slug: "movento-blumotion-50",
    price: 320,
    image: null,
    category: "מסילות",
  },
  {
    id: "4",
    name: "ידית למטבח מודרני",
    slug: "modern-kitchen-handle",
    price: 65,
    image: null,
    category: "ידיות",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-bl from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              פרזול ואקססוריז
              <br />
              ברמה אחרת
            </h1>
            <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              למעלה מ-40 שנה של מומחיות. המותגים המובילים בעולם, ישירות אליכם.
              לבית, למטבח, לכל חלל.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/categories">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                  לקטלוג המלא
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  אודות Modaco
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">קטגוריות</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative bg-gray-100 rounded-xl p-6 hover:bg-gray-200 transition-colors min-h-[140px] flex flex-col justify-end"
            >
              <h3 className="font-bold text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">מוצרים מובילים</h2>
          <Link
            href="/products"
            className="text-sm text-blue-600 hover:underline"
          >
            לכל המוצרים
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust banner */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">40+</div>
              <div className="text-sm text-gray-600">שנות ניסיון</div>
            </div>
            <div>
              <div className="text-2xl font-bold">Blum</div>
              <div className="text-sm text-gray-600">מותגים מובילים</div>
            </div>
            <div>
              <div className="text-2xl font-bold">B2B</div>
              <div className="text-sm text-gray-600">מחירים לאנשי מקצוע</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-gray-600">חנות מקוונת</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

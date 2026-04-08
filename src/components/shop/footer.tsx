import Link from "next/link";

export function ShopFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Modaco</h3>
            <p className="text-sm leading-relaxed">
              למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. מוצרים מובילים
              מהמותגים הטובים בעולם, ישירות אליכם.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4">קטגוריות</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories/hinges" className="hover:text-white">
                  צירים
                </Link>
              </li>
              <li>
                <Link href="/categories/slides" className="hover:text-white">
                  מסי��ות
                </Link>
              </li>
              <li>
                <Link href="/categories/faucets" className="hover:text-white">
                  ברזי מטבח
                </Link>
              </li>
              <li>
                <Link href="/categories/handles" className="hover:text-white">
                  ידיות
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/accessories"
                  className="hover:text-white"
                >
                  אקססוריז לבית
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">צרו קשר</h3>
            <ul className="space-y-2 text-sm">
              <li>טלפון: 052-6804945</li>
              <li>
                <Link href="/about" className="hover:text-white">
                  אודות
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  יצירת קשר
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white">
                  מדיניות משלוחים
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  תקנון
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Modaco. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}

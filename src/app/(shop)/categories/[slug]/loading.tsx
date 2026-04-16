export default function CategoryLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24" dir="rtl">
      <div className="max-w-3xl mb-12">
        <div className="h-3 w-20 bg-bone rounded mb-5 animate-pulse" />
        <div className="h-12 lg:h-16 w-3/4 bg-bone rounded mb-4 animate-pulse" />
        <div className="h-4 w-24 bg-bone/60 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] w-full bg-bone/60 animate-pulse" />
            <div className="h-3 w-16 bg-bone/60 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-bone rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-bone/60 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

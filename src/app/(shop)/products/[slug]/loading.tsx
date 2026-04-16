export default function ProductLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-10">
        <div className="h-3 w-12 bg-bone rounded animate-pulse" />
        <div className="h-3 w-3 bg-bone/60 rounded animate-pulse" />
        <div className="h-3 w-20 bg-bone rounded animate-pulse" />
        <div className="h-3 w-3 bg-bone/60 rounded animate-pulse" />
        <div className="h-3 w-32 bg-bone rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="aspect-square w-full bg-bone/60 animate-pulse mb-4" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-bone/60 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="h-3 w-20 bg-bone rounded animate-pulse" />
          <div className="h-10 w-full bg-bone rounded animate-pulse" />
          <div className="h-6 w-24 bg-bone/60 rounded animate-pulse" />
          <div className="h-24 w-full bg-bone/40 rounded animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-16 bg-bone rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-12 w-24 bg-bone/60 animate-pulse" />
              <div className="h-12 w-24 bg-bone/60 animate-pulse" />
              <div className="h-12 w-24 bg-bone/60 animate-pulse" />
            </div>
          </div>
          <div className="h-14 w-full bg-ink/80 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

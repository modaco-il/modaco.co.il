export default function CatalogLoading() {
  return (
    <div dir="rtl">
      {/* Hero skeleton */}
      <section className="relative h-[70vh] min-h-[520px] bg-ink">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-ink/50 to-ink/95" />
        <div className="relative h-full flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-3xl">
              <div className="h-3 w-24 bg-cream/20 rounded mb-6 animate-pulse" />
              <div className="h-16 lg:h-24 w-1/2 bg-cream/15 rounded mb-4 animate-pulse" />
              <div className="h-16 lg:h-24 w-1/3 bg-cream/15 rounded mb-6 animate-pulse" />
              <div className="h-5 w-3/4 bg-cream/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Editorial spread skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <section
          key={i}
          className={i === 1 ? "bg-ink" : i === 2 ? "bg-cream-deep" : "bg-cream"}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div
                className={`aspect-[4/5] lg:aspect-[5/6] lg:col-span-6 ${
                  i % 2 === 1 ? "lg:order-2" : "lg:order-1"
                } ${i === 1 ? "bg-cream/10" : "bg-bone/60"} animate-pulse`}
              />
              <div
                className={`lg:col-span-5 space-y-6 ${
                  i % 2 === 1 ? "lg:order-1 lg:col-start-2" : "lg:order-2"
                }`}
              >
                <div
                  className={`h-3 w-32 rounded animate-pulse ${
                    i === 1 ? "bg-cream/20" : "bg-bone"
                  }`}
                />
                <div
                  className={`h-14 lg:h-20 w-1/2 rounded animate-pulse ${
                    i === 1 ? "bg-cream/15" : "bg-bone"
                  }`}
                />
                <div
                  className={`h-6 w-3/4 rounded animate-pulse ${
                    i === 1 ? "bg-cream/10" : "bg-bone/70"
                  }`}
                />
                <div
                  className={`h-24 w-full rounded animate-pulse ${
                    i === 1 ? "bg-cream/10" : "bg-bone/40"
                  }`}
                />
                <div
                  className={`h-12 w-48 rounded animate-pulse ${
                    i === 1 ? "bg-cream/20" : "bg-ink/80"
                  }`}
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

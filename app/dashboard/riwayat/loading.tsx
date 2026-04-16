export default function RiwayatLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header Skeleton */}
      <header className="flex flex-col gap-2 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200"></div>
        <div className="h-4 w-96 animate-pulse rounded-lg bg-stone-100"></div>
      </header>

      {/* List Skeleton */}
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="divide-y divide-stone-200">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-32 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-stone-100"></div>
                </div>
                <div className="h-4 w-40 animate-pulse rounded-md bg-stone-100"></div>
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <div className="h-6 w-24 animate-pulse rounded-md bg-stone-200"></div>
                <div className="h-5 w-5 animate-pulse rounded-md bg-stone-100"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

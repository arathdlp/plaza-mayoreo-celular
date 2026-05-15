function CardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="aspect-[4/3] w-full animate-pulse bg-white/10" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-6 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-11 w-full animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function ProductosSkeleton() {
  return (
    <>
      <div className="border-b border-white/5 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="h-11 w-full max-w-md animate-pulse rounded-xl bg-white/10" />
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <li key={i}>
              <CardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

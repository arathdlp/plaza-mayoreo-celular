export default function ProductoDetalleSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-wrap gap-2">
        <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-200" />
        <div className="flex flex-col gap-4">
          <div className="h-6 w-28 animate-pulse rounded-full bg-gray-200" />
          <div className="h-10 w-full max-w-lg animate-pulse rounded-lg bg-gray-200" />
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-24 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="mt-6 h-12 w-40 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-8 h-14 w-full animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="mt-12 h-5 w-40 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

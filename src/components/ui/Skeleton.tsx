export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return <Skeleton className="w-full aspect-[21/9] rounded-none" />;
}

export function HeroSliderSkeleton() {
  return <Skeleton className="w-full aspect-[4/3] md:aspect-[21/9] rounded-none" />;
}

export function FlashSaleSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-36 bg-white rounded-2xl overflow-hidden border">
            <Skeleton className="w-full aspect-square rounded-none" />
            <div className="p-2 space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-full mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

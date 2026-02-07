import { OfferCardSkeleton } from "@/lib/ui/data-display/offer-card-skeleton";

export default function SearchLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto md:p-5">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Shop Smarter. Flex Harder.</h1>
        <div className="h-6 w-48 mx-auto bg-muted rounded animate-pulse mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <OfferCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    </div>
  );
}

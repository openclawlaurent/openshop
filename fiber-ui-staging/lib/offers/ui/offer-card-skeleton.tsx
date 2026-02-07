export function OfferCardSkeleton() {
  return (
    <div className="flex items-center bg-card border border-border rounded-lg animate-pulse">
      <div className="h-16 w-16 flex-shrink-0 m-3 bg-muted rounded-md" />
      <div className="flex flex-1 items-center justify-between py-3 pr-3 pl-1">
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-muted rounded mb-2 w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="w-4 h-4 bg-muted rounded ml-2 flex-shrink-0" />
      </div>
    </div>
  );
}

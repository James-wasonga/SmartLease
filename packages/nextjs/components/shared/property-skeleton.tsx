import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertyCardSkeleton() {
  return (
    <Card className="w-full rounded-2xl overflow-hidden shadow-md">
      <Skeleton className="h-48 w-full rounded-none" /> {/* Image */}
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" /> {/* Property Title */}
        <Skeleton className="h-4 w-1/3" /> {/* Price */}
        <Skeleton className="h-4 w-1/2" /> {/* Location or details */}
        <div className="flex space-x-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="rounded-2xl shadow">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-1/3" /> {/* Label */}
              <Skeleton className="h-8 w-1/2" /> {/* Value */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border shadow-sm">
        <div className="p-4">
          <Skeleton className="h-6 w-1/4 mb-4" /> {/* Table Title */}
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            {/* Table Rows */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
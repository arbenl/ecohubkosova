import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function KeyPartnersSkeleton() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-48" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-b pb-4 last:border-0 last:pb-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
          <div className="flex justify-end mt-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="border-b pb-4 last:border-0 last:pb-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
          <div className="flex justify-end mt-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="border-b pb-4 last:border-0 last:pb-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
          <div className="flex justify-end mt-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="pt-2">
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

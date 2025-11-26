import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-100">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-10 w-80 mb-3" />
              <Skeleton className="h-6 w-96 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <section>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 md:p-6"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-8 w-16 mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick actions skeleton */}
      <section>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Activity skeleton */}
      <section>
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <CardContent className="p-8 text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto mb-6" />
            <Skeleton className="h-9 w-32 rounded-full mx-auto" />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

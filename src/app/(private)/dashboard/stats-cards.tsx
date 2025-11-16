 "use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStatsCards } from "@/hooks/use-dashboard-stats"

export function StatsCards({ stats }: { stats: any }) {
  const cards = useDashboardStatsCards(stats)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map(({ title, description, value, Icon }) => (
        <Card key={title} className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <Icon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

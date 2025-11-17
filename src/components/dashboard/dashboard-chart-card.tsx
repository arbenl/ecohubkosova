"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardChart } from "./dashboard-chart"
import { useDashboardFilters, type DashboardMetric, type DashboardTimeRange } from "@/hooks/use-dashboard-filters"

const RANGE_LABELS: { label: string; value: DashboardTimeRange }[] = [
  { label: "Gjithë", value: "overall" },
  { label: "Muaji", value: "monthly" },
  { label: "Java", value: "weekly" },
]

export function DashboardChartCard({ data }: { data: DashboardMetric[] }) {
  const { timeRange, setTimeRange, filteredData } = useDashboardFilters(data)

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-gray-900">Përmbledhje</CardTitle>
          <CardDescription>Shikoni prirjet e entiteteve kryesore</CardDescription>
        </div>
        <div className="flex gap-2">
          {RANGE_LABELS.map(({ label, value }) => (
            <Button
              key={value}
              type="button"
              variant={timeRange === value ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setTimeRange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <DashboardChart data={filteredData} />
      </CardContent>
    </Card>
  )
}

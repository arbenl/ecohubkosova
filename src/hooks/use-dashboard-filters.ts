"use client"

import { useMemo, useState } from "react"

export type DashboardTimeRange = "overall" | "monthly" | "weekly"

export type DashboardMetric = {
  name: string
  total: number
  trend?: number[]
}

const RANGE_CONFIG: Record<DashboardTimeRange, number> = {
  overall: Infinity,
  monthly: 4,
  weekly: 1,
}

export function useDashboardFilters(initialData: DashboardMetric[]) {
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>("overall")

  const filteredData = useMemo(() => {
    const sliceCount = RANGE_CONFIG[timeRange]

    return initialData.map((metric) => {
      if (!metric.trend || sliceCount === Infinity) {
        return metric
      }

      const values = metric.trend.slice(-sliceCount)
      const total = values.reduce((sum, value) => sum + value, 0)
      return {
        ...metric,
        total,
      }
    })
  }, [initialData, timeRange])

  return {
    timeRange,
    setTimeRange,
    filteredData,
  }
}

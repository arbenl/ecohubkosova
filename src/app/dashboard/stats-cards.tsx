import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, ShoppingCart, Building } from "lucide-react"

export function StatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="glass-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Organizata</CardTitle>
          <Building className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.organizationsCount}</div>
          <p className="text-xs text-gray-500 mt-1">Të aprovuara</p>
        </CardContent>
      </Card>

      <Card className="glass-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Artikuj</CardTitle>
          <BookOpen className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.articlesCount}</div>
          <p className="text-xs text-gray-500 mt-1">Të publikuar</p>
        </CardContent>
      </Card>

      <Card className="glass-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Anëtarë</CardTitle>
          <Users className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.usersCount}</div>
          <p className="text-xs text-gray-500 mt-1">Të regjistruar</p>
        </CardContent>
      </Card>

      <Card className="glass-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Listime</CardTitle>
          <ShoppingCart className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.listingsCount}</div>
          <p className="text-xs text-gray-500 mt-1">Në treg</p>
        </CardContent>
      </Card>
    </div>
  )
}
